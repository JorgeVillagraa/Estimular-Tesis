const turnoModel = require('../models/turnoModel');





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
