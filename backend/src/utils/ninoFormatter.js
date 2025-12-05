function formatResponsables(responsables = []) {
  return responsables
    .map((relacion) => {
      const responsable = relacion?.responsable || {};
      const nombre =
        responsable.nombre ??
        responsable.nombre_responsable ??
        null;
      const apellido =
        responsable.apellido ??
        responsable.apellido_responsable ??
        null;

      return {
        id_responsable: responsable.id_responsable ?? null,
        nombre,
        apellido,
        telefono: responsable.telefono ?? null,
        email: responsable.email ?? null,
        parentesco: relacion?.parentesco ?? null,
        es_principal: relacion?.es_principal ?? false,
      };
    })
    .filter((item) => item.id_responsable || item.nombre || item.apellido);
}

function parseDiscountDescriptor(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return { tipo: 'ninguno', valor: 0 };
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
    return { tipo: 'ninguno', valor: 0 };
  }

  if (parsed > 1) {
    return { tipo: 'monto', valor: Number(parsed.toFixed(2)) };
  }

  return { tipo: 'porcentaje', valor: Math.min(Math.max(parsed, 0), 1) };
}

function formatNinoDetails(nino) {
  if (!nino) {
    return {
      paciente_id: null,
      paciente_nombre: null,
      paciente_apellido: null,
      paciente_fecha_nacimiento: null,
      paciente_dni: null,
      paciente_certificado_discapacidad: null,
      paciente_tipo: null,
      paciente_activo: null,
      paciente_foto_perfil: null,
      paciente_obra_social_id: null,
      paciente_obra_social: null,
      paciente_cud: null,
      paciente_responsables: [],
      paciente_titular_id: null,
      paciente_titular_nombre: null,
      paciente_titular_parentesco: null,
      paciente_titular_es_principal: null,
      paciente_email: null,
      paciente_telefono: null,
      telefono: null,
      email: null,
      titular_nombre: null,
      obra_social: null,
      paciente_obra_social_descuento: null,
      paciente_obra_social_descuento_tipo: 'ninguno',
      paciente_obra_social_descuento_valor: 0,
      paciente_obra_social_descuento_porcentaje: null,
      cud: null,
    };
  }

  const obraSocialNombre =
    nino.obra_social?.nombre ??
    nino.obra_social?.nombre_obra_social ??
    null;

  let obraSocialDescuento = nino.obra_social?.descuento;
  if (obraSocialDescuento === undefined || obraSocialDescuento === null) {
    obraSocialDescuento =
      nino.paciente_obra_social_descuento ?? nino.descuento ?? nino.obra_social_descuento ?? null;
  }

  const obraSocialDescuentoDescriptor = parseDiscountDescriptor(obraSocialDescuento);
  const obraSocialDescuentoMonto =
    obraSocialDescuentoDescriptor.tipo === 'monto'
      ? obraSocialDescuentoDescriptor.valor
      : null;
  const obraSocialDescuentoPorcentaje =
    obraSocialDescuentoDescriptor.tipo === 'porcentaje'
      ? obraSocialDescuentoDescriptor.valor
      : null;

  const responsables = formatResponsables(nino.responsables);
  const principal =
    responsables.find((rel) => rel.es_principal) || responsables[0] || null;
  const titularNombre = principal
    ? [principal.nombre, principal.apellido]
        .filter(Boolean)
        .join(' ')
        .trim() || null
    : null;
  const cudLabel = nino.certificado_discapacidad ? 'Sí' : 'No posee';

  return {
    paciente_id: nino.id_nino ?? null,
    paciente_nombre: nino.nombre ?? null,
    paciente_apellido: nino.apellido ?? null,
    paciente_fecha_nacimiento: nino.fecha_nacimiento ?? null,
    paciente_dni: nino.dni ?? null,
    paciente_certificado_discapacidad: Boolean(
      nino.certificado_discapacidad
    ),
    paciente_tipo: nino.tipo ?? null,
    paciente_activo: nino.activo ?? null,
    paciente_foto_perfil: nino.foto_perfil ?? null,
    paciente_obra_social_id:
      nino.obra_social?.id_obra_social ?? nino.id_obra_social ?? null,
    paciente_obra_social: obraSocialNombre,
    paciente_cud: cudLabel,
    paciente_responsables: responsables,
    paciente_titular_id: principal?.id_responsable ?? null,
    paciente_titular_nombre: titularNombre,
    paciente_titular_parentesco: principal?.parentesco ?? null,
    paciente_titular_es_principal: principal?.es_principal ?? null,
    paciente_email: principal?.email ?? null,
    paciente_telefono: principal?.telefono ?? null,
    telefono: principal?.telefono ?? null,
    email: principal?.email ?? null,
    titular_nombre: titularNombre,
    obra_social: obraSocialNombre,
    paciente_obra_social_descuento: obraSocialDescuentoMonto,
    paciente_obra_social_descuento_tipo: obraSocialDescuentoDescriptor.tipo,
    paciente_obra_social_descuento_valor: obraSocialDescuentoDescriptor.valor,
    paciente_obra_social_descuento_porcentaje: obraSocialDescuentoPorcentaje,
    cud: cudLabel,
  };
}

module.exports = {
  formatResponsables,
  formatNinoDetails,
};
