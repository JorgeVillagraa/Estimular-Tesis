const pool = require('../config/db');






async function getPagosByTurnoId(turnoId) {
  const sql = 'SELECT * FROM pagos WHERE turno_id = ?';
  const [rows] = await pool.query(sql, [turnoId]);
  return rows;
}







async function updatePagoStatus(pagoId, estado) {
  const sql = 'UPDATE pagos SET estado = ? WHERE id = ?';
  const [result] = await pool.query(sql, [estado, pagoId]);
  return result;
}







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
