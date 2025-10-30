/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import API_BASE_URL from "../constants/api";
import "../styles/Notificacion.css";

const CACHE_DURATION_MS = 30_000;
const POLLING_INTERVAL_MS = 30_000;

const NotificacionContext = createContext();

export const useNotificaciones = () => useContext(NotificacionContext);

export const NotificacionProvider = ({ children, loggedInProfesionalId }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [lastId, setLastId] = useState(null);
  const audioRef = useRef(null);
  const lastFetchRef = useRef(0);
  const isFetchingRef = useRef(false);

  const resetState = useCallback(() => {
    setNotificaciones([]);
    setLastId(null);
    lastFetchRef.current = 0;
  }, []);

  useEffect(() => {
    resetState();
  }, [loggedInProfesionalId, resetState]);

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notificacion1.mp3");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error("Error reproduciendo sonido de notificación:", error);
      });
    } catch (error) {
      console.error("Error inicializando sonido de notificación:", error);
    }
  }, []);

  const fetchNotificaciones = useCallback(
    async ({ force = false } = {}) => {
      if (!loggedInProfesionalId || isFetchingRef.current) return;

      const now = Date.now();
      if (!force && lastFetchRef.current && now - lastFetchRef.current < CACHE_DURATION_MS) {
        return;
      }

      try {
        isFetchingRef.current = true;
        const url = lastId
          ? `${API_BASE_URL}/api/notificaciones?lastId=${lastId}`
          : `${API_BASE_URL}/api/notificaciones`;

        const res = await axios.get(url, {
          headers: { "X-User-ID": loggedInProfesionalId },
        });

        const { lastId: newLastId, notificaciones: nuevasNotificaciones } = res.data || {};

        if (Array.isArray(nuevasNotificaciones) && nuevasNotificaciones.length > 0) {
          setNotificaciones((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const merged = [...prev];
            nuevasNotificaciones.forEach((item) => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
              }
            });
            merged.sort((a, b) => a.id - b.id);
            return merged;
          });
          playSound();
        }

        if (typeof newLastId === "number") {
          setLastId(newLastId);
        }
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      } finally {
        lastFetchRef.current = Date.now();
        isFetchingRef.current = false;
      }
    },
    [lastId, loggedInProfesionalId, playSound]
  );

  useEffect(() => {
    if (!loggedInProfesionalId) return;

    fetchNotificaciones({ force: true });

    const interval = setInterval(() => {
      fetchNotificaciones({ force: false });
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchNotificaciones, loggedInProfesionalId]);

  const removeNotificacion = useCallback((id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue = {
    notificaciones,
    refreshNotificaciones: () => fetchNotificaciones({ force: true }),
    removeNotificacion,
    lastId,
  };

  return (
    <NotificacionContext.Provider value={contextValue}>
      {children}
      <div className="notificacion-container">
        {notificaciones.map((notif) => (
          <NotificacionToast
            key={notif.id}
            notificacion={notif}
            onDismiss={removeNotificacion}
          />
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
