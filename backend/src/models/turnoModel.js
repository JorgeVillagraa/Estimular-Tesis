const supabase = require('../config/db');

async function getTurnosByDate(date) {
  const startOfDay = date; // Expecting 'YYYY-MM-DD'
  const endOfDay = new Date(date);
  endOfDay.setDate(endOfDay.getDate() + 1);
  const endOfDayString = endOfDay.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('turnos')
    .select(`
      id, inicio, fin, estado, notas,
      paciente:pacientes (id, nombre, apellido, fecha_nacimiento, dni),
      consultorio:consultorios (id, nombre),
      servicio:servicios (id, nombre),
      profesionales:turno_profesionales (
        usuario:usuarios (id, nombre_mostrar)
      )
    `)
    .gte('inicio', startOfDay)
    .lt('inicio', endOfDayString)
    .order('inicio', { ascending: true });

  if (error) throw error;

  // Map data safely, handling potential null relationships
  return data.map(turno => ({
    id: turno.id,
    inicio: turno.inicio,
    fin: turno.fin,
    estado: turno.estado,
    notas: turno.notas,
    paciente_id: turno.paciente?.id,
    paciente_nombre: turno.paciente?.nombre,
    paciente_apellido: turno.paciente?.apellido,
    paciente_fecha_nacimiento: turno.paciente?.fecha_nacimiento,
    paciente_dni: turno.paciente?.dni,
    profesional_ids: turno.profesionales?.map(p => p.usuario?.id).filter(Boolean).join(',') || '',
    profesional_nombres: turno.profesionales?.map(p => p.usuario?.nombre_mostrar).filter(Boolean).join(',') || '',
    consultorio_id: turno.consultorio?.id,
    consultorio_nombre: turno.consultorio?.nombre,
    servicio_id: turno.servicio?.id,
    servicio_nombre: turno.servicio?.nombre
  }));
}

async function updateTurno(turnoId, dataToUpdate) {
  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await supabase
    .from('turnos')
    .update(dataToUpdate)
    .eq('id', turnoId)
    .select('id'); // Select a minimal field to check for success

  if (error) throw error;
  
  return { affectedRows: data ? data.length : 0 };
}

async function getTurnoById(turnoId) {
  const { data, error } = await supabase
    .from('turnos')
    .select(`
      *,
      paciente:pacientes(nombre, apellido),
      profesionales:turno_profesionales(profesional_id)
    `)
    .eq('id', turnoId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  if (!data) return null;

  // Format professional IDs to match the expected comma-separated string
  const profesional_ids = data.profesionales?.map(p => p.profesional_id).join(',') || '';
  
  return {
    ...data,
    paciente_nombre: data.paciente?.nombre,
    paciente_apellido: data.paciente?.apellido,
    profesional_ids
  };
}

module.exports = {
  getTurnosByDate,
  updateTurno,
  getTurnoById,
};