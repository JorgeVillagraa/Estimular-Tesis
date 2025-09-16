import React, { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import './../styles/TurnoModal.css';

export default function TurnoModal({ event, onClose, onUpdate, loggedInProfesionalId }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (event) {
      setStart(moment(event.start).format('YYYY-MM-DDTHH:mm'));
      setEnd(moment(event.end).format('YYYY-MM-DDTHH:mm'));
    }
  }, [event]);

  if (!event) return null;

  const { data: turno } = event;
  const isMyEvent = turno.profesional_ids?.split(',').includes(String(loggedInProfesionalId));

  const makeUpdateRequest = async (data) => {
    try {
      await axios.put(`http://localhost:3001/api/turnos/${event.id}`, data, {
        headers: { 'X-User-ID': loggedInProfesionalId }
      });
      onUpdate(); // Recarga los eventos en el calendario
      onClose(); // Cierra el modal
    } catch (error) {
      console.error("Error updating turno:", error);
      alert('Error al actualizar el turno: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSave = () => {
    makeUpdateRequest({
      inicio: moment(start).format('YYYY-MM-DD HH:mm:ss'),
      fin: moment(end).format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  const handleConfirm = () => {
    makeUpdateRequest({ estado: 'confirmado' });
  };

  const handleCancel = () => {
    if (window.confirm('¿Está seguro de que desea cancelar este turno?')) {
      makeUpdateRequest({ estado: 'cancelado' });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <img 
            src={`/pacientes/${turno.paciente_dni}.jpg`} 
            alt={`Foto de ${turno.paciente_nombre}`}
            className="modal-patient-img"
            onError={(e) => { e.target.onerror = null; e.target.src='/src/assets/persona_prueba1.png'}} // Fallback image
          />
          <div className="modal-patient-info">
            <h2>{turno.paciente_nombre} {turno.paciente_apellido}</h2>
            <p>Nacimiento: {moment(turno.paciente_fecha_nacimiento).format('DD/MM/YYYY')}</p>
            <p>Servicio: {turno.servicio_nombre}</p>
          </div>
        </div>

        <div className="modal-body">
          {isMyEvent ? (
            <>
              <h3>Acciones Rápidas</h3>
              <div className="modal-actions">
                {turno.estado !== 'confirmado' && <button className="btn-confirm" onClick={handleConfirm}>Confirmar Turno</button>}
                {turno.estado !== 'cancelado' && <button className="btn-cancel" onClick={handleCancel}>Cancelar Turno</button>}
              </div>

              <h3>Reagendar</h3>
              <div className="modal-form">
                <label>Inicio</label>
                <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
                <label>Fin</label>
                <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
                <button className="btn-save" onClick={handleSave}>Guardar Cambios</button>
              </div>
            </>
          ) : (
            <p>No tiene permisos para modificar este turno.</p>
          )}
        </div>
      </div>
    </div>
  );
}
