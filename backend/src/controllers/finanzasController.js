const { supabaseAdmin } = require('../config/db');

function clampPercent(value) {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
    if (parsed < 0) return 0;
    if (parsed > 1) return 1;
    return parsed;
}

function parseObraSocialDescuento(raw) {
    if (raw === null || raw === undefined) {
        return { tipo: 'ninguno', valor: 0 };
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
        return { tipo: 'ninguno', valor: 0 };
    }
    if (parsed > 1) {
        return { tipo: 'monto', valor: Number(parsed.toFixed(2)) };
    }
    return { tipo: 'porcentaje', valor: clampPercent(parsed) };
}

function computeCoberturaDesdeDescriptor(pago, descriptor) {
    const estado = String(pago?.estado || '').toLowerCase();
    const montoBase = Number(pago?.monto || 0);

    if (!descriptor || descriptor.tipo === 'ninguno' || montoBase < 0) {
        return {
            cobertura: 0,
            montoOriginal: Math.max(montoBase, 0),
        };
    }

    if (estado === 'pendiente') {
        if (descriptor.tipo === 'monto') {
            const descuento = Number(descriptor.valor || 0);
            if (!Number.isFinite(descuento) || Number.isNaN(descuento) || descuento <= 0) {
                return { cobertura: 0, montoOriginal: Math.max(montoBase, 0) };
            }
            const cobertura = Math.min(descuento, Math.max(montoBase, 0));
            return {
                cobertura,
                montoOriginal: Math.max(montoBase, 0),
            };
        }

        if (descriptor.tipo === 'porcentaje') {
            const ratio = clampPercent(descriptor.valor);
            if (ratio <= 0 || ratio >= 1 || montoBase <= 0) {
                return { cobertura: 0, montoOriginal: Math.max(montoBase, 0) };
            }
            const cobertura = Number((montoBase * ratio).toFixed(2));
            return {
                cobertura,
                montoOriginal: Math.max(montoBase, 0),
            };
        }
    }

    const finalAmount = Math.max(montoBase, 0);

    if (descriptor.tipo === 'monto') {
        const descuento = Number(descriptor.valor || 0);
        if (!Number.isFinite(descuento) || Number.isNaN(descuento) || descuento <= 0) {
            return { cobertura: 0, montoOriginal: finalAmount };
        }
        const montoOriginal = Math.max(0, Number((finalAmount + descuento).toFixed(2)));
        return {
            cobertura: Math.min(descuento, montoOriginal),
            montoOriginal,
        };
    }

    if (descriptor.tipo === 'porcentaje') {
        const ratio = clampPercent(descriptor.valor);
        if (ratio <= 0 || ratio >= 1) {
            return { cobertura: 0, montoOriginal: finalAmount };
        }
        const montoOriginal = Number((finalAmount / (1 - ratio)).toFixed(2));
        const cobertura = Math.max(0, Number((montoOriginal - finalAmount).toFixed(2)));
        return {
            cobertura,
            montoOriginal,
        };
    }

    return { cobertura: 0, montoOriginal: finalAmount };
}

function parseNotasJson(rawNotas) {
    if (!rawNotas || typeof rawNotas !== 'string') {
        return null;
    }
    try {
        const parsed = JSON.parse(rawNotas);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_error) {
        return null;
    }
}

// GET /api/finanzas/resumen-mensual?anio=2025
// Devuelve por cada mes del año: deberes, haberes y cobros de meses anteriores.
const getResumenMensual = async (req, res) => {
    const anio = Number.parseInt(req.query.anio, 10) || new Date().getFullYear();

    try {
        const inicioAnio = new Date(Date.UTC(anio, 0, 1));
        const finAnio = new Date(Date.UTC(anio + 1, 0, 1));

        const desdeIso = inicioAnio.toISOString();
        const hastaIso = finAnio.toISOString();

        // Cargamos todos los pagos del año (por fecha de registro) junto a su turno.
        const { data: pagos, error: pagosError } = await supabaseAdmin
            .from('pagos')
            .select('id, monto, estado, registrado_en, turno_id, nino_id, notas, turno:turnos ( id, inicio, estado )')
            .gte('registrado_en', desdeIso)
            .lt('registrado_en', hastaIso);

        if (pagosError) throw pagosError;

        const ninoIds = Array.from(
            new Set(
                (pagos || [])
                    .map((pago) => Number(pago.nino_id))
                    .filter((id) => Number.isInteger(id) && id > 0)
            )
        );

        let descuentosPorNino = new Map();
        if (ninoIds.length > 0) {
            const { data: ninosData, error: ninosError } = await supabaseAdmin
                .from('ninos')
                .select('id_nino, obra_social:obras_sociales!ninos_id_obra_social_fkey ( descuento )')
                .in('id_nino', ninoIds);

            if (ninosError) throw ninosError;

            descuentosPorNino = new Map(
                (ninosData || []).map((nino) => [
                    nino.id_nino,
                    parseObraSocialDescuento(nino?.obra_social?.descuento),
                ])
            );
        }

        // También necesitamos los turnos del año para calcular deberes (pendientes) del mes.
        const { data: turnos, error: turnosError } = await supabaseAdmin
            .from('turnos')
            .select('id, inicio')
            .gte('inicio', desdeIso)
            .lt('inicio', hastaIso);

        if (turnosError) throw turnosError;

        const meses = Array.from({ length: 12 }, (_, i) => i); // 0-11
        const labelsMes = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
        ];

        const now = new Date();

        const resumen = meses.map((mesIndex) => {
            const inicioMes = new Date(Date.UTC(anio, mesIndex, 1));
            const finMes = new Date(Date.UTC(anio, mesIndex + 1, 1));

            const inicioMesIso = inicioMes.toISOString();
            const finMesIso = finMes.toISOString();

            const turnosMes = (turnos || []).filter((t) => {
                const f = t.inicio ? new Date(t.inicio) : null;
                return f && f.toISOString() >= inicioMesIso && f.toISOString() < finMesIso;
            });

            const pagosMes = (pagos || []).filter((p) => {
                const f = p.registrado_en ? new Date(p.registrado_en) : null;
                return f && f.toISOString() >= inicioMesIso && f.toISOString() < finMesIso;
            });

            const deberes = (pagos || [])
                .filter((p) => {
                    if (p.estado !== 'pendiente') return false;
                    const turno = p.turno || null;
                    if (!turno) return false;
                    const estadoTurno = String(turno.estado || '')
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase();
                    if (estadoTurno !== 'completado') return false;
                    const f = turno.inicio ? new Date(turno.inicio) : null;
                    if (!f) return false;
                    const iso = f.toISOString();
                    if (iso > now.toISOString()) return false;
                    return iso >= inicioMesIso && iso < finMesIso;
                })
                .reduce((sum, p) => sum + Number(p.monto || 0), 0);

            const pagosCompletadosMes = pagosMes.filter((p) => p.estado === 'completado');

            const haberes = pagosCompletadosMes.reduce(
                (sum, p) => sum + Number(p.monto || 0),
                0
            );

            const cobrosMesesAnteriores = pagosCompletadosMes
                .filter((p) => {
                    const turno = p.turno || null;
                    const f = turno && turno.inicio ? new Date(turno.inicio) : null;
                    if (!f) return false;
                    return f.toISOString() < inicioMesIso;
                })
                .reduce((sum, p) => sum + Number(p.monto || 0), 0);

            const coberturaObraSocial = pagosMes.reduce((sum, pago) => {
                const notasData = parseNotasJson(pago.notas);
                if (notasData && typeof notasData === 'object') {
                    const montoOriginalNota = Number(
                        notasData.monto_original ??
                            notasData.montoOriginal ??
                            notasData.precio_original ??
                            notasData.precioOriginal ??
                            0
                    );
                    const descuentoNota = Number(
                        notasData.descuento_monto ??
                            notasData.descuentoMonto ??
                            notasData.descuento_aplicado_monto ??
                            0
                    );
                    const montoActual = Number(pago.monto || 0);
                    if (Number.isFinite(montoOriginalNota) && montoOriginalNota > 0) {
                        const coberturaDesdeNotas = Math.max(
                            0,
                            Number((montoOriginalNota - montoActual).toFixed(2))
                        );
                        if (coberturaDesdeNotas > 0) {
                            return sum + coberturaDesdeNotas;
                        }
                    }
                    if (Number.isFinite(descuentoNota) && descuentoNota > 0) {
                        return sum + Number(descuentoNota.toFixed(2));
                    }
                }

                const descriptor = descuentosPorNino.get(Number(pago.nino_id)) || {
                    tipo: 'ninguno',
                    valor: 0,
                };
                const { cobertura } = computeCoberturaDesdeDescriptor(pago, descriptor);
                return sum + cobertura;
            }, 0);

            const id = `${anio}-${String(mesIndex + 1).padStart(2, '0')}`;
            const labelMes = `${labelsMes[mesIndex]} ${anio}`;

            return {
                id,
                mes: labelMes,
                deberes,
                haberes,
                cobrosMesesAnteriores,
                coberturaObraSocial,
                // Ganancia neta = (Cobros de meses anteriores + Ganancia bruta) - Deberes
                gananciaNeta: cobrosMesesAnteriores + haberes - deberes,
            };
        });

        return res.json({ success: true, data: resumen });
    } catch (err) {
        console.error('getResumenMensual error', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener resumen mensual',
            error: err.message,
        });
    }
};

// GET /api/finanzas/resumen-mensual-detalle?anio=2025&mesIndex=10
// Devuelve para un mes concreto el resumen por departamento
// (solo turnos confirmados/completados), con sumas de deberes y haberes.
const getResumenMensualDetalle = async (req, res) => {
    const anio = Number.parseInt(req.query.anio, 10) || new Date().getFullYear();
    const mesIndex = Number.parseInt(req.query.mesIndex, 10) || 0; // 0-11

    try {
        const inicioMes = new Date(Date.UTC(anio, mesIndex, 1));
        const finMes = new Date(Date.UTC(anio, mesIndex + 1, 1));

        const inicioMesIso = inicioMes.toISOString();
        const finMesIso = finMes.toISOString();

        const { data: pagos, error: pagosError } = await supabaseAdmin
            .from('pagos')
            .select(`
                id,
                monto,
                estado,
                registrado_en,
                turno:turnos!pagos_turno_id_fkey (
                    id,
                    inicio,
                    estado,
                    departamento:profesiones!turnos_departamento_id_fkey (
                        id_departamento,
                        nombre
                    )
                )
            `)
            .gte('registrado_en', inicioMesIso)
            .lt('registrado_en', finMesIso);

        if (pagosError) throw pagosError;

        const now = new Date();
        const resumenPorDepartamento = new Map();

        (pagos || []).forEach((pago) => {
            const turno = pago.turno || null;
            if (!turno) return;

            const estadoTurnoNormalizado = String(turno.estado || '')
                .normalize('NFD')
                .replace(/[^\p{L}\p{N}\s]/gu, '')
                .toLowerCase();

            if (estadoTurnoNormalizado !== 'completado' && estadoTurnoNormalizado !== 'confirmado') {
                return;
            }

            const departamento = turno.departamento || {};
            const depId = departamento.id_departamento || 0;
            const depNombre = departamento.nombre || 'Sin departamento';

            if (!resumenPorDepartamento.has(depId)) {
                resumenPorDepartamento.set(depId, {
                    departamentoId: depId,
                    departamentoNombre: depNombre,
                    deberes: 0,
                    haberes: 0,
                });
            }

            const item = resumenPorDepartamento.get(depId);
            const monto = Number(pago.monto || 0);

            const turnoInicio = turno.inicio ? new Date(turno.inicio) : null;
            const turnoInicioIso = turnoInicio ? turnoInicio.toISOString() : null;

            const esDelMesActual =
                turnoInicioIso && turnoInicioIso >= inicioMesIso && turnoInicioIso < finMesIso &&
                turnoInicioIso <= now.toISOString();

            if (pago.estado === 'pendiente' && esDelMesActual) {
                item.deberes += monto;
            }

            if (pago.estado === 'completado') {
                item.haberes += monto;
            }
        });

        const resultado = Array.from(resumenPorDepartamento.values()).sort((a, b) => {
            return String(a.departamentoNombre || '').localeCompare(String(b.departamentoNombre || ''), 'es');
        });

        return res.json({
            success: true,
            data: resultado,
        });
    } catch (err) {
        console.error('getResumenMensualDetalle error', err);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener resumen mensual por departamento',
            error: err.message,
        });
    }
};

module.exports = { getResumenMensual, getResumenMensualDetalle };

