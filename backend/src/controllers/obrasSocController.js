const { supabaseAdmin } = require('../config/db');
const {
  resolveStorageAsset,
  deleteStorageAsset,
  uploadObraSocialLogoIfNeeded,
  STORAGE_BUCKET_OBRAS_SOCIALES,
  isHttpUrl,
} = require('../utils/storage');

async function enrichObraSocialRecord(obra) {
  if (!obra) return obra;
  try {
    const logo = await resolveStorageAsset(
      obra.logo_path,
      undefined,
      STORAGE_BUCKET_OBRAS_SOCIALES
    );
    return {
      ...obra,
      logo_path: logo.path ?? obra.logo_path ?? null,
      logo_url: logo.signedUrl || null,
    };
  } catch (err) {
    console.warn('enrichObraSocialRecord error:', err?.message || err);
    return { ...obra, logo_url: null };
  }
}

async function enrichObraSocialList(obras) {
  if (!Array.isArray(obras) || obras.length === 0) return obras || [];
  return Promise.all(obras.map(enrichObraSocialRecord));
}

async function applyLogoMutation(obra, logoValue) {
  if (!obra || logoValue === undefined) return obra;
  const obraId = obra.id_obra_social;
  if (!obraId) return obra;

  const previousPath = obra.logo_path || null;
  let nextPath = previousPath;

  const clean = (val) => (typeof val === 'string' ? val.trim() : val);
  const payload = clean(logoValue);

  try {
    if (payload === null) {
      if (previousPath) {
        await deleteStorageAsset(previousPath, STORAGE_BUCKET_OBRAS_SOCIALES);
      }
      nextPath = null;
    } else if (payload === '') {
      if (previousPath) {
        await deleteStorageAsset(previousPath, STORAGE_BUCKET_OBRAS_SOCIALES);
      }
      nextPath = null;
    } else if (typeof payload === 'string') {
      if (payload.startsWith('data:image')) {
        const upload = await uploadObraSocialLogoIfNeeded(obraId, payload, {
          previousPath,
        });
        if (upload?.path) {
          nextPath = upload.path;
        }
      } else if (isHttpUrl(payload)) {
        if (previousPath && previousPath !== payload) {
          await deleteStorageAsset(previousPath, STORAGE_BUCKET_OBRAS_SOCIALES);
        }
        nextPath = payload;
      } else {
        nextPath = payload;
      }
    }

    if (nextPath !== previousPath) {
      const { data: updated, error } = await supabaseAdmin
        .from('obras_sociales')
        .update({ logo_path: nextPath })
        .eq('id_obra_social', obraId)
        .select('*')
        .single();
      if (error) throw error;
      return updated;
    }
  } catch (err) {
    console.error('applyLogoMutation error:', err?.message || err);
    throw err;
  }

  return obra;
}

// GET /api/obras-sociales
// Params: search, page=1, pageSize=10, estado (opcional, 'todos' para ignorar)
async function listarObrasSociales(req, res) {
  try {
    const { search = '', page = 1, pageSize = 10, estado } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const size = Math.max(parseInt(pageSize, 10) || 10, 1);
    const from = (pageNum - 1) * size;
    const to = from + size - 1;

    let query = supabaseAdmin
      .from('obras_sociales')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('nombre_obra_social', `%${search}%`);
    }
    if (estado && estado !== 'todos') {
      query = query.eq('estado', estado);
    }

    query = query.order('nombre_obra_social', { ascending: true }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const enriched = await enrichObraSocialList(data || []);
    return res.json({ success: true, data: enriched, total: count || 0 });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error al listar obras sociales' });
  }
}

// GET /api/obras-sociales/estados
async function listarEstadosObraSocial(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('obras_sociales')
      .select('estado');
    if (error) throw error;
    const estados = Array.from(new Set((data || []).map((r) => r.estado).filter(Boolean)));
    return res.json({ success: true, data: estados });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error al listar estados' });
  }
}

// POST /api/obras-sociales
async function crearObraSocial(req, res) {
  try {
    const { nombre_obra_social, estado, logo } = req.body || {};
    if (!nombre_obra_social || !String(nombre_obra_social).trim()) {
      return res.status(400).json({ success: false, message: 'El nombre de la obra social es obligatorio' });
    }
    const insertPayload = {
      nombre_obra_social: String(nombre_obra_social).trim(),
    };
    if (estado) insertPayload.estado = estado;

    const { data, error } = await supabaseAdmin
      .from('obras_sociales')
      .insert([insertPayload])
      .select('*')
      .single();
    if (error) throw error;

  let obra = data;
  obra = await applyLogoMutation(obra, logo);
  const enriched = await enrichObraSocialRecord(obra);
  return res.status(201).json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error al crear la obra social' });
  }
}

// PUT /api/obras-sociales/:id
async function editarObraSocial(req, res) {
  try {
    const { id } = req.params;
    const { nombre_obra_social, estado, logo } = req.body || {};
    const payload = {};
    if (nombre_obra_social !== undefined) payload.nombre_obra_social = String(nombre_obra_social).trim();
    if (estado !== undefined) payload.estado = estado;
    let obra;
    if (Object.keys(payload).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('obras_sociales')
        .update(payload)
        .eq('id_obra_social', id)
        .select('*')
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, message: 'Obra social no encontrada' });
        }
        throw error;
      }
      obra = data;
    } else if (logo !== undefined) {
      const { data, error } = await supabaseAdmin
        .from('obras_sociales')
        .select('*')
        .eq('id_obra_social', id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, message: 'Obra social no encontrada' });
        }
        throw error;
      }
      obra = data;
    } else {
      return res.status(400).json({ success: false, message: 'Nada para actualizar' });
    }

    obra = await applyLogoMutation(obra, logo);
    const enriched = await enrichObraSocialRecord(obra);
    return res.json({ success: true, data: enriched });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error al editar la obra social' });
  }
}

// DELETE /api/obras-sociales/:id
async function borrarObraSocial(req, res) {
  try {
    const { id } = req.params;
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('obras_sociales')
      .select('logo_path')
      .eq('id_obra_social', id)
      .single();
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Obra social no encontrada' });
      }
      throw fetchError;
    }

    if (existing?.logo_path) {
      try {
        await deleteStorageAsset(existing.logo_path, STORAGE_BUCKET_OBRAS_SOCIALES);
      } catch (deleteErr) {
        console.warn('borrarObraSocial delete logo error:', deleteErr?.message || deleteErr);
      }
    }

    const { error } = await supabaseAdmin
      .from('obras_sociales')
      .delete()
      .eq('id_obra_social', id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error al borrar la obra social' });
  }
}

module.exports = {
  listarObrasSociales,
  listarEstadosObraSocial,
  crearObraSocial,
  editarObraSocial,
  borrarObraSocial,
};
