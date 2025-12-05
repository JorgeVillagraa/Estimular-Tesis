const clampPercent = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
};

const toPositiveAmount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return null;
  if (parsed <= 0) return null;
  return Number(parsed.toFixed(2));
};

const parseDiscountDescriptor = (rawValue) => {
  if (rawValue === null || rawValue === undefined) {
    return { tipo: "ninguno", valor: 0 };
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
    return { tipo: "ninguno", valor: 0 };
  }

  if (parsed > 1) {
    return { tipo: "monto", valor: Number(parsed.toFixed(2)) };
  }

  return { tipo: "porcentaje", valor: clampPercent(parsed) };
};

const buildDescriptorFromRow = (raw) => {
  const tipoRaw = typeof raw.paciente_obra_social_descuento_tipo === "string"
    ? raw.paciente_obra_social_descuento_tipo.toLowerCase()
    : null;

  if (tipoRaw === "monto" || tipoRaw === "porcentaje") {
    const valor = Number(raw.paciente_obra_social_descuento_valor ?? raw.paciente_obra_social_descuento);
    if (tipoRaw === "monto") {
      const monto = toPositiveAmount(valor);
      if (monto) {
        return { tipo: "monto", valor: monto };
      }
    }

    if (tipoRaw === "porcentaje") {
      const porcentaje = clampPercent(valor);
      if (porcentaje > 0) {
        return { tipo: "porcentaje", valor: porcentaje };
      }
    }
  }

  const rawValor = raw.paciente_obra_social_descuento ?? raw.obra_social_descuento ?? raw.descuento;
  if (rawValor !== undefined && rawValor !== null) {
    return parseDiscountDescriptor(rawValor);
  }

  const nestedValor = raw.obra_social?.descuento;
  if (nestedValor !== undefined && nestedValor !== null) {
    return parseDiscountDescriptor(nestedValor);
  }

  return { tipo: "ninguno", valor: 0 };
};

export function normalizeNinoRow(raw = {}) {
  const obraSocialSource =
    raw && typeof raw === "object" && raw.obra_social && typeof raw.obra_social === "object"
      ? raw.obra_social
      : null;

  const obraSocialNombre =
    obraSocialSource?.nombre_obra_social ??
    obraSocialSource?.nombre ??
    raw.paciente_obra_social ??
    null;

  const idObraSocial =
    raw.id_obra_social ??
    raw.paciente_obra_social_id ??
    obraSocialSource?.id_obra_social ??
    null;

  const certifiedValue =
    raw.certificado_discapacidad ?? raw.paciente_certificado_discapacidad;

  const descriptor = buildDescriptorFromRow(raw);
  const descuentoMonto = descriptor.tipo === "monto" ? descriptor.valor : null;
  const descuentoPorcentaje = descriptor.tipo === "porcentaje" ? descriptor.valor : null;

  const obraSocialFinal = obraSocialSource
    ? { ...obraSocialSource }
    : obraSocialNombre
      ? {
          id_obra_social: idObraSocial,
          nombre_obra_social: obraSocialNombre,
        }
      : null;

  if (obraSocialFinal) {
    if (descriptor.tipo === "porcentaje") {
      obraSocialFinal.descuento = descuentoPorcentaje;
    } else if (descriptor.tipo === "monto") {
      obraSocialFinal.descuento_monto = descuentoMonto;
    }
  }

  return {
    ...raw,
    id_nino: raw.id_nino ?? raw.paciente_id ?? raw.id ?? null,
    nombre: raw.nombre ?? raw.paciente_nombre ?? null,
    apellido: raw.apellido ?? raw.paciente_apellido ?? null,
    dni: raw.dni ?? raw.paciente_dni ?? null,
    fecha_nacimiento:
      raw.fecha_nacimiento ?? raw.paciente_fecha_nacimiento ?? null,
    certificado_discapacidad: Boolean(certifiedValue),
    tipo: raw.tipo ?? raw.paciente_tipo ?? null,
    id_obra_social: idObraSocial,
    obra_social: obraSocialFinal,
    obra_social_descuento: descuentoPorcentaje ?? null,
    obra_social_descuento_monto: descuentoMonto,
    obra_social_descuento_tipo: descriptor.tipo,
    paciente_obra_social_descuento: descuentoMonto,
    paciente_obra_social_descuento_tipo: descriptor.tipo,
    paciente_obra_social_descuento_valor: descriptor.valor,
    paciente_obra_social_descuento_porcentaje: descuentoPorcentaje,
  };
}

export function extractRawNinosList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  if (payload.data && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }
  return [];
}

export function getNinosTotal(payload, fallbackLength = 0) {
  if (!payload || typeof payload !== "object") return fallbackLength;
  if (typeof payload.total === "number") return payload.total;
  if (typeof payload.count === "number") return payload.count;
  if (typeof payload.data?.total === "number") return payload.data.total;
  return fallbackLength;
}

export function parseNinosResponse(responseData) {
  const payload = responseData ?? {};
  const rawList = extractRawNinosList(payload);
  const normalizedList = rawList.map((row) => normalizeNinoRow(row));
  const total = getNinosTotal(payload, normalizedList.length);
  return {
    rawList,
    list: normalizedList,
    total,
  };
}
