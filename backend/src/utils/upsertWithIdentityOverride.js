const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_ROLE_KEY = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_TOKEN ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
).trim()

const fetchImpl = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null

async function upsertWithIdentityOverride(table, payload, { onConflict } = {}) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw Object.assign(new Error('Supabase URL o service role key faltante para override de identidad'), {
            code: 'CONFIG_MISSING',
        })
    }
    if (!fetchImpl) {
        throw Object.assign(new Error('Fetch API no disponible en el entorno actual'), {
            code: 'FETCH_UNAVAILABLE',
        })
    }

    const query = []
    if (onConflict) {
        query.push(`on_conflict=${encodeURIComponent(onConflict)}`)
    }
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}${query.length ? `?${query.join('&')}` : ''}`

    const bodyPayload = Array.isArray(payload) ? payload : [payload]

    const preferVariants = [
        'resolution=merge-duplicates,return=representation,override-identity=TRUE',
        'resolution=merge-duplicates,return=representation,override=identity',
        'resolution=merge-duplicates,return=representation,overriding-system-value=true',
        'return=representation,override-identity=TRUE',
        'return=representation,override=identity',
        'return=representation,overriding-system-value=true',
        'resolution=merge-duplicates,return=representation',
        'return=representation',
    ]

    let lastError = null

    for (const prefer of preferVariants) {
        try {
            const response = await fetchImpl(url, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_SERVICE_ROLE_KEY,
                    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                    Prefer: prefer,
                },
                body: JSON.stringify(bodyPayload),
            })

            const text = await response.text()
            let parsed = null
            if (text) {
                try {
                    parsed = JSON.parse(text)
                } catch (err) {
                    parsed = null
                }
            }

            if (!response.ok) {
                lastError = new Error(
                    (parsed && (parsed.message || parsed.error?.message || parsed.error_description)) ||
                    text ||
                    response.statusText
                )
                if (parsed && typeof parsed === 'object') {
                    if (parsed.code) lastError.code = parsed.code
                    if (parsed.details) lastError.details = parsed.details
                    if (parsed.hint) lastError.hint = parsed.hint
                }
                lastError.status = response.status
                console.error('[upsertWithIdentityOverride] Prefer variant failed', prefer, response.status, text)
                continue
            }

            if (Array.isArray(parsed)) {
                return parsed[0] || null
            }
            return parsed
        } catch (err) {
            lastError = err
            console.error('[upsertWithIdentityOverride] Request error with Prefer', prefer, err)
        }
    }

    throw lastError || new Error('No se pudo completar el upsert con override de identidad')
}

module.exports = { upsertWithIdentityOverride }
