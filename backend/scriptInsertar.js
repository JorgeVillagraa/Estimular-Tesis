/*
    Script de inserción masiva de usuarios (y opcionalmente sus perfiles en equipo)

    Cómo usar:
    1) Configura .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
    2) Edita el array USERS con los datos a insertar.
    3) Ejecuta:  node backend/scriptInsertar.js

    Notas:
    - El esquema requiere usuarios.id_rol (NOT NULL) y dni (bigint, UNIQUE).
    - Si incluyes el objeto "equipo" con nombre, apellido y fecha_nacimiento (YYYY-MM-DD),
        se creará también la fila 1:1 en la tabla equipo con id_profesional = id_usuario.
*/

require('dotenv').config()
const bcrypt = require('bcrypt')
const { supabaseAdmin } = require('./src/config/db')

const DEFAULT_PASSWORD = 'estimular_2025'
const UPDATE_IF_EXISTS = false // si el usuario (dni) ya existe: false=omitir, true=actualizar password_hash y/o id_rol

// Personaliza aquí los usuarios a insertar.
// Puedes pasar id_rol (numérico) o rolNombre (string, debe existir en tabla roles).
// Para crear equipo, debes proveer al menos: nombre, apellido, fecha_nacimiento (YYYY-MM-DD)
const USERS = [
    // Ejemplos:
    // {
    //   dni: '44028630',
    //   contrasena: null, // usa DEFAULT_PASSWORD
    //   id_rol: 1,        // o rolNombre: 'profesional'
    //   activo: true,
    //   equipo: {
    //     nombre: 'Tito',
    //     apellido: 'Dev',
    //     telefono: '11-5555-5555',
    //     fecha_nacimiento: '1995-10-24',
    //     profesion: 'Psicólogo',
    //     email: 'tito@estimular.com',
    //     foto_perfil: null,
    //   },
    // },
]

function isValidDni(dni) {
    return /^\d{7,15}$/.test(String(dni || ''))
}

function isValidDateYYYYMMDD(s) {
    if (!s || typeof s !== 'string') return false
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
    const d = new Date(s)
    return !isNaN(d.getTime())
}

async function fetchRoleIdByName(nombreRol) {
    const { data, error } = await supabaseAdmin
        .from('roles')
        .select('id_rol, nombre_rol')
        .eq('nombre_rol', String(nombreRol))
        .limit(1)
        .maybeSingle()
    if (error) throw error
    return data ? data.id_rol : null
}

async function resolveRoleId(u) {
    if (u.id_rol !== undefined && u.id_rol !== null && !Number.isNaN(Number(u.id_rol))) {
        return Number(u.id_rol)
    }
    if (u.rolNombre) {
        const id = await fetchRoleIdByName(u.rolNombre)
        if (!id) throw new Error(`El rol "${u.rolNombre}" no existe. Crea el rol o usa id_rol.`)
        return id
    }
    throw new Error('id_rol es obligatorio (o especifica rolNombre existente)')
}

async function findUserByDni(dni) {
    const { data, error } = await supabaseAdmin
        .from('usuarios')
        .select('id_usuario, dni, id_rol, activo')
        .eq('dni', Number(dni))
        .limit(1)
        .maybeSingle()
    if (error) throw error
    return data
}

async function insertUser({ dni, contrasena, id_rol, activo = true }) {
    const password = String(contrasena || DEFAULT_PASSWORD)
    const hash = await bcrypt.hash(password, 12)
    const payload = { dni: Number(dni), password_hash: hash, id_rol: Number(id_rol), activo: !!activo }
    const { data, error } = await supabaseAdmin
        .from('usuarios')
        .insert([payload])
        .select('id_usuario, dni, id_rol, activo')
        .maybeSingle()
    if (error) throw error
    return data
}

async function updateExistingUser(userId, { contrasena, id_rol, activo }) {
    const update = {}
    if (contrasena) update.password_hash = await bcrypt.hash(String(contrasena), 12)
    if (id_rol !== undefined && id_rol !== null) update.id_rol = Number(id_rol)
    if (typeof activo === 'boolean') update.activo = activo
    if (Object.keys(update).length === 0) return null
    const { data, error } = await supabaseAdmin
        .from('usuarios')
        .update(update)
        .eq('id_usuario', Number(userId))
        .select('id_usuario, dni, id_rol, activo')
        .maybeSingle()
    if (error) throw error
    return data
}

async function upsertEquipo(id_profesional, equipo) {
    if (!equipo) return null
    const { nombre, apellido, fecha_nacimiento } = equipo
    if (!nombre || !apellido || !isValidDateYYYYMMDD(String(fecha_nacimiento))) {
        console.warn(`↪ Equipo omitido para id_profesional=${id_profesional}: ` +
            `se requiere nombre, apellido y fecha_nacimiento (YYYY-MM-DD).`)
        return null
    }
    const payload = {
        id_profesional: Number(id_profesional),
        nombre: String(equipo.nombre),
        apellido: String(equipo.apellido),
        telefono: equipo.telefono ? String(equipo.telefono) : null,
        email: equipo.email ? String(equipo.email) : null,
        fecha_nacimiento: String(equipo.fecha_nacimiento),
        profesion: equipo.profesion ? String(equipo.profesion) : null,
        foto_perfil: equipo.foto_perfil || null,
    }
    const { data, error } = await supabaseAdmin
        .from('equipo')
        .upsert([payload], { onConflict: 'id_profesional' })
        .select('id_profesional, nombre, apellido, fecha_nacimiento, profesion, telefono, email')
        .maybeSingle()
    if (error) throw error
    return data
}

async function run() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
        process.exit(1)
    }

    if (!Array.isArray(USERS) || USERS.length === 0) {
        console.log('No hay usuarios en la lista USERS. Edita el archivo y vuelve a ejecutar.')
        return
    }

    const results = { inserted: 0, updated: 0, skipped: 0, errors: 0 }

    for (const raw of USERS) {
        try {
            if (!isValidDni(raw.dni)) {
                throw new Error(`DNI inválido: ${raw.dni}`)
            }
            const id_rol = await resolveRoleId(raw)

            const existing = await findUserByDni(raw.dni)
            if (existing && !UPDATE_IF_EXISTS) {
                console.log(`↪ Usuario dni=${raw.dni} ya existe (id=${existing.id_usuario}). Omitido.`)
                results.skipped++
                continue
            }

            let userRow = existing
            if (!existing) {
                userRow = await insertUser({ dni: raw.dni, contrasena: raw.contrasena, id_rol, activo: raw.activo })
                console.log(`✔ Insertado usuario id=${userRow.id_usuario} dni=${userRow.dni}`)
                results.inserted++
            } else {
                const updated = await updateExistingUser(existing.id_usuario, { contrasena: raw.contrasena, id_rol, activo: raw.activo })
                if (updated) {
                    console.log(`✔ Actualizado usuario id=${updated.id_usuario} dni=${updated.dni}`)
                    results.updated++
                    userRow = updated
                } else {
                    console.log(`↪ Usuario id=${existing.id_usuario} sin cambios`)
                    results.skipped++
                }
            }

            // Equipo opcional
            if (raw.equipo) {
                const eq = await upsertEquipo(userRow.id_usuario, raw.equipo)
                if (eq) console.log(`  ↳ Equipo preparado para id_profesional=${eq.id_profesional}`)
            }
        } catch (err) {
            results.errors++
            console.error('✖ Error procesando usuario', raw && raw.dni, '-', err && err.message ? err.message : err)
        }
    }

    console.log('--- Resumen ---')
    console.log(results)
}

run().then(() => process.exit(0)).catch((e) => {
    console.error('Fallo general del script:', e && e.message ? e.message : e)
    process.exit(1)
})

