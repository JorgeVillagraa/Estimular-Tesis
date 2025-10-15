// config/db.js (CommonJS)
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Carga las variables del archivo .env
dotenv.config()

// URL y claves desde .env
// Soportamos varias posibles names en .env: SUPABASE_SERVICE_ROLE_KEY (recommended),
// SUPABASE_ANON_KEY, o SUPABASE_KEY (legacy in this project).
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim()
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLIC_KEY || '').trim()

// Cliente “admin” → usa la service_role_key (para el backend)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Cliente “público” → respeta RLS, se puede usar con JWT de usuario
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Alias para compatibilidad: muchos controladores esperan `supabase` exportado
const supabase = supabaseAdmin

// Test rápido al iniciar el servidor
async function testConnection() {
    try {
        const probeTables = ['candidatos', 'obras_sociales', 'usuarios']
        let lastErr = null

        // Prefer admin client for probing if a service role key is present
        const probeClient = SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabasePublic

        for (const t of probeTables) {
            try {
                const { data, error } = await probeClient.from(t).select('*').limit(1)
                if (!error) {
                    console.log(`✅ Supabase conectado correctamente (probe: ${t}).`)
                    return
                }
                lastErr = error
            } catch (e) {
                lastErr = e
            }
        }
        if (lastErr) {
            console.error('❌ Falló el probe a Supabase:', lastErr && lastErr.message ? lastErr.message : lastErr)
        }
    } catch (err) {
        console.error('❌ Error conectando con Supabase:', err && err.message ? err.message : err)
    }
}

module.exports = { supabase, supabaseAdmin, supabasePublic, testConnection }
