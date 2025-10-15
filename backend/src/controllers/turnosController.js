const { supabaseAdmin } = require('../config/db');

/**
 * Asignar turnos a un candidato para cada departamento requerido (candidato_departamentos)
 * Request body: { candidato_id, fecha_inicio (optional ISO), duracion_min (optional) }
 * Comportamiento:
 * - Lee los departamentos requeridos desde candidato_departamentos con estado 'pendiente' o 'asignada'
 * - Para cada departamento crea un turno mínimo vinculado al candidato
 * - Devuelve la lista de turnos creados
 */
const assignTurnosForCandidato = async (req, res) => {
    try {
        const { candidato_id, fecha_inicio, duracion_min = 30 } = req.body || {};
        if (!candidato_id) return res.status(400).json({ success: false, message: 'Falta candidato_id' });

        // Obtener los departamentos requeridos para el candidato
        const { data: candDeps, error: depsErr } = await supabaseAdmin
            .from('candidato_departamentos')
            .select('id, id_departamento, departamento: departamentos(id_departamento, nombre, duracion_default_min), estado, profesional_asignado_id')
            .eq('id_candidato', candidato_id)
            .in('estado', ['pendiente', 'asignada'])
            ;

        if (depsErr) throw depsErr;

        if (!candDeps || candDeps.length === 0) {
            return res.status(404).json({ success: false, message: 'No hay departamentos requeridos para este candidato' });
        }

        const created = [];

        // For each required department create a minimal turno
        for (const dep of candDeps) {
            // Build minimal scheduling: use provided fecha_inicio or now + small offset
            const inicio = fecha_inicio ? new Date(fecha_inicio) : new Date(Date.now() + 5 * 60 * 1000);
            const fin = new Date(inicio.getTime() + (duracion_min || dep.departamento.duracion_default_min || 30) * 60 * 1000);

            const turnoPayload = {
                candidato_id: Number(candidato_id),
                departamento_id: dep.id_departamento || dep.departamento?.id_departamento,
                inicio: inicio.toISOString(),
                fin: fin.toISOString(),
                duracion_min: duracion_min || dep.departamento?.duracion_default_min || 30,
                estado: 'pendiente',
                creado_en: new Date().toISOString(),
            };

            const { data: turno, error: turnoErr } = await supabaseAdmin
                .from('turnos')
                .insert([turnoPayload])
                .select('id, candidato_id, departamento_id, inicio, fin, duracion_min, estado')
                .maybeSingle();

            if (turnoErr) {
                console.error('Error creando turno para departamento', dep, turnoErr);
                // continue creating others but report
                continue;
            }
            created.push(turno);
        }

        return res.status(201).json({ success: true, created, total: created.length });
    } catch (err) {
        console.error('assignTurnosForCandidato error', err);
        return res.status(500).json({ success: false, message: 'Error asignando turnos', error: err.message });
    }
};

module.exports = { assignTurnosForCandidato };
