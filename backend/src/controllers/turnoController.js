const turnoModel = require('../models/turnoModel');
const notificacionModel = require('../models/notificacionModel');

/**
 * Maneja la solicitud para obtener los turnos de una fecha específica.
 */
async function handleGetTurnos(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'El parámetro \'date\' es requerido.' });
  }

  try {
    const turnos = await turnoModel.getTurnosByDate(date);
    res.json({ success: true, data: turnos });
  } catch (error) {
    console.error('Error al obtener los turnos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}




async function handleUpdateTurno(req, res) {
  const { id } = req.params;
  const dataToUpdate = req.body;
  const loggedInUserId = req.headers['x-user-id']; // Autenticación fake

  if (!loggedInUserId) {
    return res.status(401).json({ success: false, message: 'No autorizado: Falta el ID de usuario.' });
  }

  if (!id || Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ success: false, message: 'Se requiere el ID del turno y datos para actualizar.' });
  }

  try {
    // Permisos para actualizar
    const turno = await turnoModel.getTurnoById(id);
    if (!turno) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado.' });
    }

    const profesionalIds = turno.profesional_ids ? turno.profesional_ids.split(',') : [];
    if (!profesionalIds.includes(String(loggedInUserId))) {
      return res.status(403).json({ success: false, message: 'No tiene permisos para modificar este turno.' });
    }

    const result = await turnoModel.updateTurno(id, dataToUpdate);
    if (result.affectedRows === 0) {
      // Fallback
      return res.status(404).json({ success: false, message: 'Turno no encontrado durante la actualización.' });
    }

    // Si se cambió el estado, crear una notificación para cada profesional
    if (dataToUpdate.estado) {
      const fullName = `${turno.paciente_nombre} ${turno.paciente_apellido}`;
      let mensaje;

      switch (dataToUpdate.estado) {
        case 'completado':
          mensaje = `Llego ${fullName}`;
          break;
        case 'no_presento':
          mensaje = `No se presento ${fullName}`;
          break;
        case 'cancelado':
          mensaje = `Cancelado el turno de ${fullName}`;
          break;
        default:
          mensaje = `El estado del turno para ${fullName} ha cambiado a: ${dataToUpdate.estado.toUpperCase()}`;
          break;
      }

      const profesionalIds = turno.profesional_ids ? turno.profesional_ids.split(',') : [];
      profesionalIds.forEach(profId => {
        notificacionModel.createNotificacion(profId, mensaje, id);
      });
    }

    res.json({ success: true, message: 'Turno actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}

module.exports = {
  handleGetTurnos,
  handleUpdateTurno,
};
