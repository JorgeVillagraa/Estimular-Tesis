const turnoModel = require('../models/turnoModel');
const notificacionModel = require('../models/notificacionModel');
const { supabaseAdmin } = require('../config/db');

function isAdminRoleName(value) {
  if (!value) return false;
  const normalized = String(value).toLowerCase();
  return normalized.includes('admin');
}

async function userIsAdmin(userId) {
  if (!userId) return false;
  try {
    const { data, error } = await supabaseAdmin
      .from('usuario_roles')
      .select('rol:roles ( id_rol, nombre_rol )')
      .eq('usuario_id', Number(userId));

    if (error) {
      console.error('userIsAdmin roles error:', error);
      return false;
    }

    return (data || [])
      .map((row) => row?.rol?.nombre_rol)
      .filter(Boolean)
      .some((name) => isAdminRoleName(name));
  } catch (err) {
    console.error('userIsAdmin exception:', err);
    return false;
  }
}

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

async function handleGetTurnoFormData(req, res) {
  try {
    const data = await turnoModel.getTurnoFormData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener datos de formulario de turno:', error);
    res.status(500).json({ success: false, message: 'No se pudo cargar la información necesaria.' });
  }
}

async function handleCreateTurno(req, res) {
  const loggedInUserId = req.headers['x-user-id']
    ? parseInt(req.headers['x-user-id'], 10)
    : null;

  const {
    departamento_id,
    consultorio_id,
    inicio,
    duracion_min,
    nino_id,
    notas,
    profesional_ids,
    precio,
    moneda,
    metodo_pago,
    estado,
  } = req.body || {};

  if (!departamento_id || !inicio || !nino_id) {
    return res.status(400).json({
      success: false,
      message:
        'Los campos departamento_id, inicio y nino_id son obligatorios para crear un turno.',
    });
  }

  try {
    const nuevoTurno = await turnoModel.createTurno({
      departamento_id,
      consultorio_id,
      inicio,
      duracion_min,
      nino_id,
      notas,
      profesional_ids,
      precio,
      moneda,
      metodo_pago,
      estado,
      creado_por: loggedInUserId,
    });

    res.status(201).json({ success: true, data: nuevoTurno });
  } catch (error) {
    console.error('Error al crear el turno:', error);
    res.status(500).json({ success: false, message: 'No se pudo crear el turno.' });
  }
}




async function handleUpdateTurno(req, res) {
  const { id } = req.params;
  const dataToUpdate = req.body;
  const loggedInUserIdHeader = req.headers['x-user-id'];
  const loggedInUserId = loggedInUserIdHeader ? Number.parseInt(loggedInUserIdHeader, 10) : null;

  if (!loggedInUserId || Number.isNaN(loggedInUserId)) {
    return res.status(401).json({ success: false, message: 'No autorizado: Falta el ID de usuario.' });
  }

  if (!id || Object.keys(dataToUpdate).length === 0) {
    return res.status(400).json({ success: false, message: 'Se requiere el ID del turno y datos para actualizar.' });
  }

  try {
    const adminOverride = await userIsAdmin(loggedInUserId);
    // Permisos para actualizar
    const turno = await turnoModel.getTurnoById(id);
    if (!turno) {
      return res.status(404).json({ success: false, message: 'Turno no encontrado.' });
    }

    const profesionalIds = turno.profesional_ids ? turno.profesional_ids.split(',') : [];
    if (!adminOverride && !profesionalIds.includes(String(loggedInUserId))) {
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
  handleGetTurnoFormData,
  handleCreateTurno,
  handleUpdateTurno,
};
