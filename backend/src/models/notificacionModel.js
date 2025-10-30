const supabase = require("../config/db");

/**
 * Inserta una nueva notificación en la base de datos.
 * @param {number} profesionalId - El ID del profesional a notificar.
 * @param {string} mensaje - El mensaje de la notificación.
 * @param {number} [turnoId] - El ID del turno relacionado (opcional).
 * @returns {Promise<object>} - El resultado de la inserción.
 */
async function createNotificacion(profesionalId, mensaje, turnoId = null) {
  const { data, error } = await supabase
    .from("notificaciones")
    .insert({ profesional_id: profesionalId, mensaje, turno_id: turnoId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene el ID de la última notificación en el sistema.
 * @returns {Promise<number>} - El ID más alto.
 */
async function getLatestNotificacionId() {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116: No rows found
    throw error;
  }
  return data ? data.id : 0;
}

/**
 * Obtiene todas las notificaciones para un profesional después de un ID dado.
 * @param {number} profesionalId - El ID del profesional.
 * @param {number} lastId - El último ID de notificación recibido.
 * @returns {Promise<Array>} - Una lista de nuevas notificaciones.
 */
async function getNotificacionesAfterId(profesionalId, lastId) {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("profesional_id", profesionalId)
    .gt("id", lastId)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

module.exports = {
  createNotificacion,
  getLatestNotificacionId,
  getNotificacionesAfterId,
};
