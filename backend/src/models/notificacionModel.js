const pool = require('../config/db');

/**
 * Inserta una nueva notificación en la base de datos.
 * @param {number} profesionalId - El ID del profesional a notificar.
 * @param {string} mensaje - El mensaje de la notificación.
 * @param {number} [turnoId] - El ID del turno relacionado (opcional).
 * @returns {Promise<object>} - El resultado de la inserción.
 */
async function createNotificacion(profesionalId, mensaje, turnoId = null) {
  const sql = 'INSERT INTO notificaciones (profesional_id, mensaje, turno_id) VALUES (?, ?, ?)';
  const [result] = await pool.query(sql, [profesionalId, mensaje, turnoId]);
  return result;
}

/**
 * Obtiene el ID de la última notificación en el sistema.
 * @returns {Promise<number>} - El ID más alto.
 */
async function getLatestNotificacionId() {
  const sql = 'SELECT MAX(id) as lastId FROM notificaciones';
  const [rows] = await pool.query(sql);
  return rows[0].lastId || 0;
}

/**
 * Obtiene todas las notificaciones para un profesional después de un ID dado.
 * @param {number} profesionalId - El ID del profesional.
 * @param {number} lastId - El último ID de notificación recibido.
 * @returns {Promise<Array>} - Una lista de nuevas notificaciones.
 */
async function getNotificacionesAfterId(profesionalId, lastId) {
  const sql = 'SELECT * FROM notificaciones WHERE profesional_id = ? AND id > ? ORDER BY id ASC';
  const [rows] = await pool.query(sql, [profesionalId, lastId]);
  return rows;
}

module.exports = { 
  createNotificacion,
  getLatestNotificacionId,
  getNotificacionesAfterId,
};
