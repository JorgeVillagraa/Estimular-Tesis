const pagoModel = require('../models/pagoModel');




async function handleGetPagos(req, res) {
  const { turno_id } = req.query;
  if (!turno_id) {
    return res.status(400).json({ success: false, message: "El parámetro 'turno_id' es requerido." });
  }
  try {
    const pagos = await pagoModel.getPagosByTurnoId(turno_id);
    res.json({ success: true, data: pagos });
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}




async function handleUpdatePago(req, res) {
  const { id } = req.params;
  const { estado, turno_id } = req.body;

  if (!estado || !turno_id) {
    return res.status(400).json({ success: false, message: "Se requiere 'estado' y 'turno_id'." });
  }

  try {
    const result = await pagoModel.updatePagoStatus(id, estado);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado.' });
    }


    const todosLosPagos = await pagoModel.getPagosByTurnoId(turno_id);
    const todosPagados = todosLosPagos.every(p => p.estado === 'completado');
    const algunoPagado = todosLosPagos.some(p => p.estado === 'completado');

    let nuevoEstadoPagoTurno = 'pendiente';
    if (todosPagados) {
      nuevoEstadoPagoTurno = 'pagado';
    } else if (algunoPagado) {
      nuevoEstadoPagoTurno = 'parcial';
    }

    await pagoModel.updateTurnoEstadoPago(turno_id, nuevoEstadoPagoTurno);

    res.json({ success: true, message: 'Pago actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}

module.exports = {
  handleGetPagos,
  handleUpdatePago,
};
