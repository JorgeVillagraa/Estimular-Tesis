import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../constants/api';
import '../styles/Notificacion.css';

const NotificacionContext = createContext();

export const useNotificaciones = () => useContext(NotificacionContext);

export const NotificacionProvider = ({ children, loggedInProfesionalId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [lastId, setLastId] = useState(null);

  const fetchNotificaciones = useCallback(async () => {
    if (!loggedInProfesionalId) return;

    try {
      const url = lastId 
        ? `${API_BASE_URL}/api/notificaciones?lastId=${lastId}`
        : `${API_BASE_URL}/api/notificaciones`;

      const res = await axios.get(url, {
        headers: { 'X-User-ID': loggedInProfesionalId }
      });

      const { lastId: newLastId, notificaciones: newNotificaciones } = res.data;

      if (newNotificaciones && newNotificaciones.length > 0) {
        setNotificaciones(prev => [...prev, ...newNotificaciones]);
        // Play sound for new notifications
        const audio = new Audio('/sounds/notificacion1.mp3');
        audio.play().catch(e => console.error("Error playing notification sound:", e));
      }
      
      setLastId(newLastId);

    } catch (error) {
      console.error('Error polling for notifications:', error);
    }
  }, [loggedInProfesionalId, lastId]);

  useEffect(() => {
    // Iniciar el polling
    const interval = setInterval(() => {
      fetchNotificaciones();
    }, 5000); // Poll cada 5 segundos

    return () => clearInterval(interval);
  }, [fetchNotificaciones]);

  const removeNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificacionContext.Provider value={{}}>
      {children}
      <div className="notificacion-container">
        {notificaciones.map(notif => (
          <NotificacionToast key={notif.id} notificacion={notif} onDismiss={removeNotificacion} />
        ))}
      </div>
    </NotificacionContext.Provider>
  );
};

const NotificacionToast = ({ notificacion, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notificacion.id);
    }, 5000); // El toast desaparece después de 5 segundos

    return () => clearTimeout(timer);
  }, [notificacion.id, onDismiss]);

  // Extraer el estado del mensaje para aplicar el color
  const getStatusFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.startsWith('llego')) {
      return 'completado';
    }
    if (lowerMessage.startsWith('no se presento')) {
      return 'no_presento';
    }
    if (lowerMessage.startsWith('cancelado el turno de')) {
      return 'cancelado';
    }
    const parts = message.split(': ');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    return 'pendiente'; // Default status
  }

  const statusClass = `status-${getStatusFromMessage(notificacion.mensaje)}`;

  return (
    <div className={`notificacion-toast ${statusClass}`} onClick={() => onDismiss(notificacion.id)}>
      <p>{notificacion.mensaje}</p>
    </div>
  );
};
