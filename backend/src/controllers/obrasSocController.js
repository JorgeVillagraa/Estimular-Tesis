const { supabaseAdmin } = require('../config/db');

const obtenerTodasLasObrasSociales = async (req, res) => {
  try {
    // seleccionar columnas que coinciden con el esquema: id_obra_social y nombre_obra_social
    const { data, error } = await supabaseAdmin
      .from('obras_sociales')
      .select('id_obra_social, nombre_obra_social')
      .order('nombre_obra_social', { ascending: true }); // orden alfabético ascendente

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las obras sociales',
        error,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error inesperado al obtener las obras sociales',
      error: err.message,
    });
  }
};

module.exports = {
  obtenerTodasLasObrasSociales,
};
