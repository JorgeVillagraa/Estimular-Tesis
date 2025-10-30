const { supabaseAdmin } = require('../config/db');

const CANDIDATO_SELECT = `*, responsables:candidato_responsables (
  parentesco,
  es_principal,
  id_responsable,
  responsable:responsables (*)
), obra_social:obras_sociales (
  id_obra_social,
  nombre_obra_social
)`;

const sanitizeSearch = (value) => String(value || '').replace(/[%']/g, '').trim();

// Obtener candidatos con búsqueda y paginación
const getCandidatos = async (req, res) => {
  const { search = '', page = 1, pageSize = 10 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

  try {
    const searchSafe = sanitizeSearch(search);

    if (searchSafe) {
      try {
        const { data: idsData, error: rpcErr } = await supabaseAdmin.rpc('search_candidatos_ids', {
          term: searchSafe,
        });
        if (rpcErr) throw rpcErr;

        const ids = (idsData || []).map((row) => row.id_candidato);
        if (ids.length === 0) {
          return res.json({ success: true, data: [], total: 0 });
        }

        const pagedIds = ids.slice(offset, offset + parseInt(pageSize, 10));
        const { data, error } = await supabaseAdmin
          .from('candidatos')
          .select(CANDIDATO_SELECT)
          .in('id_candidato', pagedIds)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ success: true, data: data || [], total: ids.length });
      } catch (rpcErr) {
        console.warn('RPC search failed, falling back to ilike search:', rpcErr?.message || rpcErr);
        const pattern = `%${searchSafe}%`;
        let query = supabaseAdmin
          .from('candidatos')
          .select(CANDIDATO_SELECT, { count: 'exact' })
          .or(`nombre_nino.ilike.${pattern},apellido_nino.ilike.${pattern},dni_nino.ilike.${pattern}`);
        query = query.order('created_at', { ascending: false }).range(offset, offset + parseInt(pageSize, 10) - 1);
        const { data, error, count } = await query;
        if (error) throw error;
        return res.json({ success: true, data, total: count || 0 });
      }
    }

    let query = supabaseAdmin
      .from('candidatos')
      .select(CANDIDATO_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(pageSize, 10) - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching candidatos:', error);
      throw error;
    }

    return res.json({ success: true, data: data || [], total: count || 0 });
  } catch (err) {
    console.error('getCandidatos failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener candidatos',
      error: err.message,
      detail: err,
    });
  }
};

const editarCandidato = async (req, res) => {
  const { id_candidato } = req.params;
  const updateData = req.body;

  if (!id_candidato || !updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, message: 'Faltan datos para editar' });
  }

  const allowed = [
    'nombre_nino',
    'apellido_nino',
    'fecha_nacimiento',
    'dni_nino',
    'certificado_discapacidad',
    'motivo_consulta',
    'id_obra_social',
  ];
  const payload = {};

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      payload[key] = updateData[key];
    }
  }

  if (payload.certificado_discapacidad !== undefined) {
    payload.certificado_discapacidad = !!payload.certificado_discapacidad;
  }

  if (payload.fecha_nacimiento) {
    const date = new Date(payload.fecha_nacimiento);
    if (!Number.isNaN(date.getTime())) {
      payload.fecha_nacimiento = date.toISOString().slice(0, 10);
    }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('candidatos')
      .update(payload)
      .eq('id_candidato', id_candidato)
      .select(CANDIDATO_SELECT)
      .maybeSingle();

    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    console.error('editarCandidato failed:', err);
    return res.status(500).json({ success: false, message: 'Error al editar candidato', error: err.message });
  }
};

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
    return res.json({ success: true, message: 'Candidato borrado' });
  } catch (err) {
    console.error('borrarCandidato failed:', err);
    return res.status(500).json({ success: false, message: 'Error al borrar candidato', error: err.message });
  }
};

const setPrincipalResponsable = async (req, res) => {
  const { id_candidato } = req.params;
  const { id_responsable } = req.body;

  if (!id_candidato || !id_responsable) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos (id_candidato o id_responsable)',
    });
  }

  try {
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('candidato_responsables')
      .select('*')
      .eq('id_candidato', id_candidato)
      .eq('id_responsable', id_responsable)
      .maybeSingle();

    if (selectError) throw selectError;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Responsable no asociado al candidato' });
    }

    const { error: clearError } = await supabaseAdmin
      .from('candidato_responsables')
      .update({ es_principal: false })
      .eq('id_candidato', id_candidato);
    if (clearError) throw clearError;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('candidato_responsables')
      .update({ es_principal: true })
      .eq('id_candidato', id_candidato)
      .eq('id_responsable', id_responsable)
      .select('id_candidato_responsable, id_candidato, id_responsable, parentesco, es_principal')
      .maybeSingle();

    if (updateError) throw updateError;

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('setPrincipalResponsable failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Error al establecer responsable principal',
      error: err.message,
    });
  }
};

module.exports = {
  getCandidatos,
  editarCandidato,
  borrarCandidato,
  setPrincipalResponsable,
};
