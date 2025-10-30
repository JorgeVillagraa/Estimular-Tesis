const supabase = require('../config/db');
const { formatNinoDetails } = require('../utils/ninoFormatter');

function normalizeText(value) {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function sanitizeSearchTerm(term) {
  return term.replace(/[%]/g, '').trim();
}

async function searchNinos(search = '', limit = 10) {
  const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 25);
  const baseSelect = `
      id_nino,
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      certificado_discapacidad,
      tipo,
      activo,
      foto_perfil,
      id_obra_social,
      obra_social:obras_sociales!ninos_id_obra_social_fkey (
        id_obra_social,
        nombre_obra_social,
        estado
      ),
      responsables:nino_responsables (
        parentesco,
        es_principal,
        responsable:responsables!nino_responsables_id_responsable_fkey (
          id_responsable,
          nombre,
          apellido,
          telefono,
          email
        )
      )
    `;

  let query = supabase
    .from('ninos')
    .select(baseSelect)
    .limit(normalizedLimit)
    .order('nombre', { ascending: true });

  const trimmed = sanitizeSearchTerm(search);
  if (trimmed) {
    const ilikeValue = `%${trimmed}%`;
    query = query.or(
      `nombre.ilike.${ilikeValue},apellido.ilike.${ilikeValue},dni.ilike.${ilikeValue}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = Array.isArray(data) ? data : [];

  if (trimmed && rows.length < normalizedLimit) {
    const fallbackLimit = Math.min(normalizedLimit * 2, 50);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('ninos')
      .select(baseSelect)
      .limit(fallbackLimit)
      .order('nombre', { ascending: true });

    if (!fallbackError && Array.isArray(fallbackData)) {
      const mergedMap = new Map();
      rows.forEach((row) => {
        if (row?.id_nino) {
          mergedMap.set(row.id_nino, row);
        }
      });
      fallbackData.forEach((row) => {
        if (row?.id_nino && !mergedMap.has(row.id_nino)) {
          mergedMap.set(row.id_nino, row);
        }
      });
      rows = Array.from(mergedMap.values());
    }
  }

  const normalizedTerm = normalizeText(trimmed);

  const formatted = rows.map((nino) => formatNinoDetails(nino));

  if (!normalizedTerm) {
    return formatted;
  }

  const filtered = formatted.filter((nino) => {
    const fieldsToCheck = [
      nino.paciente_nombre,
      nino.paciente_apellido,
      nino.paciente_dni,
      nino.titular_nombre,
    ];

    if (Array.isArray(nino.paciente_responsables)) {
      nino.paciente_responsables.forEach((responsable) => {
        fieldsToCheck.push(responsable.nombre);
        fieldsToCheck.push(responsable.apellido);
        if (responsable.nombre || responsable.apellido) {
          fieldsToCheck.push(
            [responsable.nombre, responsable.apellido].filter(Boolean).join(' ')
          );
        }
      });
    }

    return fieldsToCheck.some((field) => normalizeText(field).includes(normalizedTerm));
  });

  return filtered.slice(0, normalizedLimit);
}

async function getNinoById(id) {
  const ninoId = parseInt(id, 10);
  if (Number.isNaN(ninoId)) return null;

  const { data, error } = await supabase
    .from('ninos')
    .select(`
      id_nino,
      nombre,
      apellido,
      dni,
      fecha_nacimiento,
      certificado_discapacidad,
      tipo,
      activo,
      foto_perfil,
      id_obra_social,
      obra_social:obras_sociales!ninos_id_obra_social_fkey (
        id_obra_social,
        nombre_obra_social,
        estado
      ),
      responsables:nino_responsables (
        parentesco,
        es_principal,
        responsable:responsables!nino_responsables_id_responsable_fkey (
          id_responsable,
          nombre,
          apellido,
          telefono,
          email
        )
      )
    `)
    .eq('id_nino', ninoId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!data) return null;
  return formatNinoDetails(data);
}

module.exports = {
  searchNinos,
  getNinoById,
};
