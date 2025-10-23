const { supabaseAdmin } = require('../config/db');

/**
 * Listar turnos con filtros.
 * Query params soportados:
 * - estado: string (e.g., 'pendiente')
 * - nino_id: number (listará turnos asignados a ese niño)
 * - disponible: 'true' | 'false' (si true => nino_id IS NULL y estado='pendiente')
 * - desde, hasta: ISO date range filter against 'inicio'
 * - limit: número máximo de filas (default 50)
 */
const listTurnos = async (req, res) => {
    try {
        const { estado, nino_id, disponible, desde, hasta, limit = 50 } = req.query || {};
        let q = supabaseAdmin
            .from('turnos')
            .select('id, departamento_id, inicio, fin, duracion_min, consultorio_id, estado, nino_id', { count: 'exact' })
            .order('inicio', { ascending: true })
            .limit(Number(limit) || 50);

        if (estado) q = q.eq('estado', estado);
        if (nino_id) q = q.eq('nino_id', Number(nino_id));

        if (String(disponible) === 'true') {
            q = q.is('nino_id', null);
            // si no se pasó estado explícito, por defecto pendientes
            if (!estado) q = q.eq('estado', 'pendiente');
        }

        if (desde) q = q.gte('inicio', new Date(desde).toISOString());
        if (hasta) q = q.lte('inicio', new Date(hasta).toISOString());

        const { data, error, count } = await q;
        if (error) throw error;
        return res.json({ success: true, data: data || [], total: count || 0 });
    } catch (err) {
        console.error('listTurnos error', err);
        return res.status(500).json({ success: false, message: 'Error al listar turnos', error: err.message });
    }
};

/**
 * Actualizar un turno (asignar/quitar niño, cambiar estado, etc.)
 * Params: id (turno id)
 * Body permitido: { nino_id: number|null, estado?: string }
 */
const updateTurno = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Falta id del turno' });
        const { nino_id, estado } = req.body || {};
        const payload = {};
        if (nino_id !== undefined) payload.nino_id = nino_id === null ? null : Number(nino_id);
        if (estado !== undefined) payload.estado = estado;
        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
        }

        const { data, error } = await supabaseAdmin
            .from('turnos')
            .update(payload)
            .eq('id', Number(id))
            .select('id, departamento_id, inicio, fin, duracion_min, consultorio_id, estado, nino_id')
            .maybeSingle();
        if (error) throw error;
        return res.json({ success: true, data });
    } catch (err) {
        console.error('updateTurno error', err);
        return res.status(500).json({ success: false, message: 'Error al actualizar turno', error: err.message });
    }
};

/**
 * (Opcional) Asignar turnos automáticos a un candidato según requerimientos.
 * Mantenemos esta función pero no es necesaria para el flujo básico de asignación manual.
 */
const assignTurnosForCandidato = async (req, res) => {
    try {
        const { candidato_id, fecha_inicio, duracion_min = 30 } = req.body || {};
        if (!candidato_id) return res.status(400).json({ success: false, message: 'Falta candidato_id' });

        // Placeholder sencillo: crear un único turno pendiente vinculado al candidato
        const inicio = fecha_inicio ? new Date(fecha_inicio) : new Date(Date.now() + 10 * 60 * 1000);
        const fin = new Date(inicio.getTime() + (duracion_min || 30) * 60 * 1000);

        const { data, error } = await supabaseAdmin
            .from('turnos')
            .insert([{ inicio: inicio.toISOString(), fin: fin.toISOString(), duracion_min: duracion_min, estado: 'pendiente', nino_id: Number(candidato_id) }])
            .select('id, departamento_id, inicio, fin, duracion_min, consultorio_id, estado, nino_id')
            .maybeSingle();
        if (error) throw error;
        return res.status(201).json({ success: true, data });
    } catch (err) {
        console.error('assignTurnosForCandidato error', err);
        return res.status(500).json({ success: false, message: 'Error asignando turnos', error: err.message });
    }
};

module.exports = { listTurnos, updateTurno, assignTurnosForCandidato };
