import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../constants/api';
import './../styles/PagoModal.css';

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
          <p>Paciente: <strong>{turno.paciente_nombre} {turno.paciente_apellido}</strong></p>
        </div>
        <div className="pago-modal-body">
          {loading ? <p>Cargando...</p> : (
            <ul className="pago-list">
              {pagos.length > 0 ? pagos.map(pago => (
                <li key={pago.id} className={`pago-item ${pago.estado === 'completado' ? 'pagado' : ''}`}>
                  <div className="pago-details">
                    <span>${pago.monto} <span className="moneda">{pago.moneda}</span></span>
                    <span>Método: {pago.metodo}</span>
                  </div>
                  {pago.estado !== 'completado' && (
                    <button className="btn-pay" onClick={() => handlePay(pago.id)}>Marcar Pagado</button>
                  )}
                </li>
              )) : <p className="no-pagos">No hay pagos registrados para este turno.</p>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
