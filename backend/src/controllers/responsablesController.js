const { supabaseAdmin } = require('../config/db');

// Buscar responsable por DNI
const buscarPorDni = async (req, res) => {
    const { dni } = req.query;
    if (!dni) return res.status(400).json({ success: false, message: 'Falta dni' });
    try {
        // If dni is purely numeric, use exact match (column is bigint in the schema),
        // otherwise fallback to ilike for partial/text searches.
        const isNumeric = /^\d+$/.test(dni);
        let query = supabaseAdmin.from('responsables').select('id_responsable, nombre, apellido, telefono, email, dni');
        if (isNumeric) {
            query = query.eq('dni', Number(dni));
        } else {
            query = query.ilike('dni', `%${dni}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return res.json({ success: true, data });
    } catch (err) {
        console.error('buscarPorDni failed:', err);
        return res.status(500).json({ success: false, message: 'Error al buscar responsable', error: err.message });
    }
};

// Listar responsables (simple)
const listarResponsables = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('responsables')
            .select('id_responsable, nombre, apellido, telefono, email')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return res.json({ success: true, data });
    } catch (err) {
        console.error('listarResponsables failed:', err);
        return res.status(500).json({ success: false, message: 'Error al listar responsables', error: err.message });
    }
};

module.exports = { buscarPorDni, listarResponsables };
