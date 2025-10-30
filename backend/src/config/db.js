const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLIC_KEY || '').trim();

if (!SUPABASE_URL) {
    console.error('❌ Supabase URL no configurada. Verifica el archivo .env');
    process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase key no configurada. Algunas operaciones podrían fallar.');
}

const supabaseAdmin = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const supabasePublic = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const supabase = supabaseAdmin;

async function testConnection() {
    try {
        const probeTables = ['candidatos', 'obras_sociales', 'usuarios'];
        let lastErr = null;

        const probeClient = SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabasePublic;

        for (const table of probeTables) {
            try {
                const { error } = await probeClient.from(table).select('*').limit(1);
                if (!error) {
                    console.log(`✅ Supabase conectado correctamente (probe: ${table}).`);
                    return;
                }
                lastErr = error;
            } catch (err) {
                lastErr = err;
            }
        }

        if (lastErr) {
            console.error('❌ Falló el probe a Supabase:', lastErr?.message || lastErr);
        }
    } catch (err) {
        console.error('❌ Error conectando con Supabase:', err?.message || err);
    }
}

const exported = supabase;
exported.supabase = supabase;
exported.supabaseAdmin = supabaseAdmin;
exported.supabasePublic = supabasePublic;
exported.testConnection = testConnection;

module.exports = exported;
