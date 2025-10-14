// config/db.js (CommonJS)
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Carga las variables del archivo .env
dotenv.config()

// URL y claves desde .env
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// Cliente “admin” → usa la service_role_key (para el backend)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Cliente “público” → respeta RLS, se puede usar con JWT de usuario
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Alias para compatibilidad: muchos controladores esperan `supabase` exportado
const supabase = supabaseAdmin

// Test rápido al iniciar el servidor
async function testConnection() {
    try {
        if (!SUPABASE_SERVICE_ROLE_KEY) {
            console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set — will probe using the public (anon) client. If you expect admin access, set SUPABASE_SERVICE_ROLE_KEY in .env.')
            // Try public (anon) client to check whether RLS/policies allow access
            const probeTablesPublic = ['candidatos', 'obras_sociales', 'usuarios']
            let lastErrPublic = null
            for (const t of probeTablesPublic) {
                try {
                    const { data, error } = await supabasePublic.from(t).select('*').limit(1)
                    if (!error) {
                        console.log(`✅ Supabase conectado correctamente (public probe: ${t}).`)
                        return
                    }
                    lastErrPublic = error
                } catch (e) {
                    lastErrPublic = e
                }
            }
            if (lastErrPublic) {
                console.error('❌ Public (anon) probe failed:', lastErrPublic && lastErrPublic.message ? lastErrPublic.message : lastErrPublic)
                console.error('Detalles (public probe):', lastErrPublic)
            }
            return
        }
        // Try a short list of app tables — some projects don't have the same
        // tables deployed yet. Stop on the first successful probe.
        const probeTables = ['candidatos', 'obras_sociales', 'usuarios']
        let lastErr = null
        for (const t of probeTables) {
            try {
                const { data, error } = await supabaseAdmin.from(t).select('*').limit(1)
                if (!error) {
                    console.log(`✅ Supabase conectado correctamente (tabla probe: ${t}).`)
                    return
                }
                lastErr = error
            } catch (e) {
                lastErr = e
            }
        }
        // If we reached here, all probes failed
        if (lastErr) throw lastErr
    } catch (err) {
        console.error('❌ Error conectando con Supabase:', err && err.message ? err.message : err)
        console.error('Detalles del error:', err)
    }
}

module.exports = { supabase, supabaseAdmin, supabasePublic, testConnection }
