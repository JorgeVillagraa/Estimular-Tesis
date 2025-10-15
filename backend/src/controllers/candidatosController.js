const { supabaseAdmin } = require('../config/db');

// Obtener candidatos con búsqueda y paginación
const getCandidatos = async (req, res) => {
  const { search = '', page = 1, pageSize = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  try {
    // Ajuste de select para que coincida con el esquema proporcionado
    const selectString = `*, responsables: candidato_responsables (parentesco, es_principal, id_responsable, responsable: responsables (*)), obra_social: obras_sociales (id_obra_social, nombre_obra_social), estado_entrevista`;

    // sanitize search to avoid accidental wildcard injection
    const searchSafe = String(search || '').replace(/[%']/g, '').trim();

    let q = supabaseAdmin.from('candidatos').select(selectString, { count: 'exact' });

    if (searchSafe) {
      const pattern = `%${searchSafe}%`;
      q = q.or(`nombre_nino.ilike.${pattern},apellido_nino.ilike.${pattern},dni_nino.ilike.${pattern}`);
    }

    q = q.order('created_at', { ascending: false }).range(offset, offset + parseInt(pageSize) - 1);

    const { data, error, count } = await q;
    if (error) {
      console.error('Error fetching candidatos:', error);
      throw error;
    }

    res.json({ success: true, data, total: count || 0 });
  } catch (err) {
    console.error('getCandidatos failed:', err);
    res.status(500).json({ success: false, message: 'Error al obtener candidatos', error: err.message, detail: err });
  }
};

// Cambiar estado de entrevista
const cambiarEstado = async (req, res) => {
  const { id_candidato } = req.params;
  const { estado_entrevista } = req.body;
  if (!id_candidato || !estado_entrevista) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('candidatos')
      .update({ estado_entrevista })
      .eq('id_candidato', id_candidato)
      .select('*, responsables: candidato_responsables (parentesco, es_principal, responsable: responsables (*)), obra_social: obras_sociales (nombre_obra_social)')
      .maybeSingle();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado', error: err.message });
  }
};

// Editar candidato
const editarCandidato = async (req, res) => {
  const { id_candidato } = req.params;
  const updateData = req.body;
  if (!id_candidato || !updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: 'Faltan datos para editar' });
  }

  // Whitelist de campos permitidos para editar
  const allowed = ['nombre_nino', 'apellido_nino', 'fecha_nacimiento', 'dni_nino', 'certificado_discapacidad', 'motivo_consulta', 'id_obra_social'];
  const payload = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(updateData, k)) {
      payload[k] = updateData[k];
    }
  }

  // Normalizaciones simples
  if (payload.certificado_discapacidad !== undefined) {
    payload.certificado_discapacidad = !!payload.certificado_discapacidad;
  }
  if (payload.fecha_nacimiento) {
    // Ensure date format yyyy-mm-dd
    const d = new Date(payload.fecha_nacimiento);
    if (!isNaN(d)) payload.fecha_nacimiento = d.toISOString().slice(0, 10);
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('candidatos')
      .update(payload)
      .eq('id_candidato', id_candidato)
      .select(`*, responsables: candidato_responsables (parentesco, es_principal, responsable: responsables (*)), obra_social: obras_sociales (nombre_obra_social), estado_entrevista`)
      .maybeSingle();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al editar candidato', error: err.message });
  }
};

// Borrar candidato
const borrarCandidato = async (req, res) => {
  const { id_candidato } = req.params;
  if (!id_candidato) {
    return res.status(400).json({ success: false, message: 'Falta id_candidato' });
  }
  try {
    const { error } = await supabaseAdmin
      .from('candidatos')
      .delete()
      .eq('id_candidato', id_candidato);
    if (error) throw error;
    res.json({ success: true, message: 'Candidato borrado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al borrar candidato', error: err.message });
  }
};

module.exports = { getCandidatos, cambiarEstado, editarCandidato, borrarCandidato };
