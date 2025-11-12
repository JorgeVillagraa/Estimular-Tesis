import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../constants/api';
import './../styles/PagoModal.css';

const clampDiscount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
};

const formatCurrency = (amount, currency = 'ARS') => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    const value = Number(amount);
    if (Number.isNaN(value)) return '';
    return `${currency} ${value.toFixed(2)}`;
  }
};

const parseNotas = (notas) => {
  if (!notas || typeof notas !== 'string') return null;
  try {
    const parsed = JSON.parse(notas);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    // Ignorar contenido no JSON
  }
  return null;
};

export default function PagoModal({ turno, onClose }) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPagos = useCallback(async () => {
    if (!turno) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/pagos?turno_id=${turno.id}`);
      setPagos(res.data.data || []); // Asegurarse de que pagos sea siempre un array
    } catch (error) {
      console.error("Error fetching pagos:", error);
      alert('No se pudieron cargar los pagos.');
    }
    setLoading(false);
  }, [turno]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  const handlePay = async (pagoId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/pagos/${pagoId}`, {
        estado: 'completado',
        turno_id: turno.id
      });
      fetchPagos();
    } catch (error) {
      console.error("Error updating pago:", error);
      alert('Error al procesar el pago.');
    }
  };

  if (!turno) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pago-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <div className="pago-modal-header">
          <h2>Gestión de Pagos del Turno</h2>
          <div className="pago-modal-subheader">
            <p>
              Paciente: <strong>{turno.paciente_nombre} {turno.paciente_apellido}</strong>
            </p>
            {turno.paciente_obra_social && (
              <p className="obra-social-label">
                Obra social: <strong>{turno.paciente_obra_social}</strong>
              </p>
            )}
          </div>
        </div>
        <div className="pago-modal-body">
          {loading ? <p>Cargando...</p> : (
            <ul className="pago-list">
              {pagos.length > 0 ? (
                pagos.map((pago) => {
                  const notasData = parseNotas(pago.notas);
                  const metaOriginal =
                    notasData && typeof notasData.monto_original === 'number'
                      ? notasData.monto_original
                      : null;
                  const metaDescuento =
                    notasData && typeof notasData.descuento_aplicado === 'number'
                      ? notasData.descuento_aplicado
                      : null;

                  const descuento = clampDiscount(
                    metaDescuento !== null ? metaDescuento : turno?.paciente_obra_social_descuento
                  );

                  let montoOriginal = metaOriginal ?? pago.monto;
                  let montoFinal = metaOriginal !== null ? pago.monto : montoOriginal;

                  if (metaOriginal === null && descuento > 0) {
                    montoFinal = Number((montoOriginal * (1 - descuento)).toFixed(2));
                  }

                  if (!Number.isFinite(montoOriginal) || Number.isNaN(montoOriginal)) {
                    montoOriginal = 0;
                  }
                  if (!Number.isFinite(montoFinal) || Number.isNaN(montoFinal)) {
                    montoFinal = 0;
                  }
                  if (montoOriginal < 0) montoOriginal = 0;
                  if (montoFinal < 0) montoFinal = 0;

                  const diferencia = montoOriginal - montoFinal;
                  const ahorro = diferencia > 0.009 ? Number(diferencia.toFixed(2)) : null;
                  const mostrarDescuento = ahorro !== null && ahorro > 0;

                  const formattedOriginal = formatCurrency(montoOriginal, pago.moneda);
                  const formattedFinal = formatCurrency(montoFinal, pago.moneda);
                  return (
                    <li
                      key={pago.id}
                      className={`pago-item ${pago.estado === 'completado' ? 'pagado' : ''}`}
                    >
                      <div className="pago-details">
                        <div className="pago-amount">
                          {mostrarDescuento ? (
                            <>
                              <span className="price-original">{formattedOriginal}</span>
                              <span className="price-arrow" aria-hidden="true">→</span>
                              <span className="price-discounted">{formattedFinal}</span>
                            </>
                          ) : (
                            <span className="price-single">{formattedOriginal}</span>
                          )}
                        </div>
                        <div className="pago-meta">
                          <span className="pago-metodo">Método: {pago.metodo}</span>
                        </div>
                      </div>
                      {pago.estado !== 'completado' && (
                        <button className="btn-pay" onClick={() => handlePay(pago.id)}>
                          Marcar Pagado
                        </button>
                      )}
                    </li>
                  );
                })
              ) : (
                <p className="no-pagos">No hay pagos registrados para este turno.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
