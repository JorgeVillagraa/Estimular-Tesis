const notificacionModel = require('../models/notificacionModel');

/**
 * Maneja la solicitud de polling para nuevas notificaciones.
 */
async function handleGetNotificaciones(req, res) {
  const loggedInUserId = req.headers['x-user-id'];
  const { lastId } = req.query;

  if (!loggedInUserId) {
    return res.status(401).json({ success: false, message: 'No autorizado.' });
  }

  try {
    if (!lastId) {
      // Primera llamada: el cliente no tiene un lastId. Devolvemos el ID más reciente.
      const latestId = await notificacionModel.getLatestNotificacionId();
      res.json({ success: true, lastId: latestId, notificaciones: [] });
    } else {
      // Llamadas subsecuentes: buscar notificaciones nuevas.
      const notificaciones = await notificacionModel.getNotificacionesAfterId(loggedInUserId, lastId);
      let newLastId = lastId;
      if (notificaciones.length > 0) {
        newLastId = notificaciones[notificaciones.length - 1].id;
      }
      res.json({ success: true, lastId: newLastId, notificaciones });
    }
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}

module.exports = { handleGetNotificaciones };
