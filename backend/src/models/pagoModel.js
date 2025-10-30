const supabase = require("../config/db");

async function getPagosByTurnoId(turnoId) {
  const { data, error } = await supabase
    .from("pagos")
    .select("*")
    .eq("turno_id", turnoId);

  if (error) throw error;
  return data;
}

async function updatePagoStatus(pagoId, estado) {
  const { data, error } = await supabase
    .from("pagos")
    .update({ estado })
    .eq("id", pagoId)
    .select("id");

  if (error) throw error;
  return { affectedRows: data ? data.length : 0 };
}

async function updateTurnoEstadoPago(turnoId, estado_pago) {
  const { data, error } = await supabase
    .from("turnos")
    .update({ estado_pago })
    .eq("id", turnoId)
    .select("id");

  if (error) throw error;
  return { affectedRows: data ? data.length : 0 };
}

module.exports = {
  getPagosByTurnoId,
  updatePagoStatus,
  updateTurnoEstadoPago,
};
