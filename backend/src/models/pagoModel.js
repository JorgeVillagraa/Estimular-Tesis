const pool = require('../config/db');

/**
 * Obtiene todos los pagos asociados a un turno específico.
 * @param {number} turnoId - El ID del turno.
 * @returns {Promise<Array>} - Una lista de pagos.
 */
async function getPagosByTurnoId(turnoId) {
  const sql = 'SELECT * FROM pagos WHERE turno_id = ?';
  const [rows] = await pool.query(sql, [turnoId]);
  return rows;
}

/**
 * Actualiza el estado de un pago específico.
 * @param {number} pagoId - El ID del pago a actualizar.
 * @param {string} estado - El nuevo estado del pago.
 * @returns {Promise<object>} - El resultado de la consulta de actualización.
 */
async function updatePagoStatus(pagoId, estado) {
  const sql = 'UPDATE pagos SET estado = ? WHERE id = ?';
  const [result] = await pool.query(sql, [estado, pagoId]);
  return result;
}

/**
 * Actualiza el estado de pago de un turno en la tabla `turnos`.
 * @param {number} turnoId - El ID del turno a actualizar.
 * @param {string} estado_pago - El nuevo estado de pago ('pagado', 'parcial', etc.).
 * @returns {Promise<object>} - El resultado de la consulta.
 */
async function updateTurnoEstadoPago(turnoId, estado_pago) {
    const sql = 'UPDATE turnos SET estado_pago = ? WHERE id = ?';
    const [result] = await pool.query(sql, [estado_pago, turnoId]);
    return result;
}

module.exports = {
  getPagosByTurnoId,
  updatePagoStatus,
  updateTurnoEstadoPago,
};
