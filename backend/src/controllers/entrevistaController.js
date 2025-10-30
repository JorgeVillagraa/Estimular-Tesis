const { supabaseAdmin } = require('../config/db');

const enviarFormularioEntrevista = async (req, res) => {
  const body = req.body || {};

  const candidatoBody = body.candidato || {
    nombre_nino: body.nombre_nino,
    apellido_nino: body.apellido_nino,
    fecha_nacimiento: body.fecha_nacimiento,
    dni_nino: body.dni_nino,
    certificado_discapacidad: body.certificado_discapacidad,
    id_obra_social: body.id_obra_social,
    obra_social_texto: body.obra_social_texto || body.obra_social,
    motivo_consulta: body.motivo_consulta,
  };

  const responsableBody = body.responsable || {
    nombre_responsable: body.nombre_responsable,
    apellido_responsable: body.apellido_responsable,
    telefono: body.telefono,
    email: body.email,
    dni: body.dni_responsable,
    parentesco: body.parentesco,
    es_principal: body.es_principal === undefined ? true : body.es_principal,
  };

  let createdObraId = null;
  let insertedCandidato = null;
  let insertedResponsable = null;

  try {
    let idObra = candidatoBody.id_obra_social ?? null;
    if (!idObra && candidatoBody.obra_social_texto && candidatoBody.obra_social_texto.trim().length > 0) {
      const nombre = candidatoBody.obra_social_texto.trim();
      const { data: obraData, error: obraErr } = await supabaseAdmin
        .from('obras_sociales')
        .insert([{ nombre_obra_social: nombre, estado: 'pendiente' }])
        .select('id_obra_social, nombre_obra_social, estado')
        .maybeSingle();

      if (obraErr) throw obraErr;
      idObra = obraData?.id_obra_social || null;
      createdObraId = idObra;
    }

    const candidatoInsert = {
      nombre_nino: candidatoBody.nombre_nino,
      apellido_nino: candidatoBody.apellido_nino,
      fecha_nacimiento: candidatoBody.fecha_nacimiento,
      dni_nino: candidatoBody.dni_nino,
      certificado_discapacidad: candidatoBody.certificado_discapacidad ?? false,
      id_obra_social: idObra || null,
      motivo_consulta: candidatoBody.motivo_consulta,
    };

    const { data: candidato, error: errorCandidato } = await supabaseAdmin
      .from('candidatos')
      .insert([candidatoInsert])
      .select(
        'id_candidato, nombre_nino, apellido_nino, fecha_nacimiento, dni_nino, certificado_discapacidad, id_obra_social, motivo_consulta'
      )
      .maybeSingle();

    if (errorCandidato) {
      if (createdObraId) {
        await supabaseAdmin.from('obras_sociales').delete().eq('id_obra_social', createdObraId);
      }
      throw errorCandidato;
    }
    insertedCandidato = candidato;

    const responsableInsert = {
      nombre: responsableBody.nombre_responsable,
      apellido: responsableBody.apellido_responsable,
      telefono: responsableBody.telefono || null,
      email: responsableBody.email || null,
      dni: responsableBody.dni || null,
      creado_en: new Date().toISOString(),
    };

    const { data: responsable, error: errorResponsable } = await supabaseAdmin
      .from('responsables')
      .insert([responsableInsert])
      .select('id_responsable, nombre, apellido, telefono, email, dni')
      .maybeSingle();

    if (errorResponsable) {
      if (insertedCandidato?.id_candidato) {
        await supabaseAdmin.from('candidatos').delete().eq('id_candidato', insertedCandidato.id_candidato);
      }
      if (createdObraId) {
        await supabaseAdmin.from('obras_sociales').delete().eq('id_obra_social', createdObraId);
      }
      throw errorResponsable;
    }
    insertedResponsable = responsable;

    const relacionInsert = {
      id_candidato: insertedCandidato.id_candidato,
      id_responsable: insertedResponsable.id_responsable,
      parentesco: responsableBody.parentesco || null,
      es_principal: responsableBody.es_principal ?? true,
    };

    const { data: relacionData, error: errorRelacion } = await supabaseAdmin
      .from('candidato_responsables')
      .insert([relacionInsert])
      .select('id_candidato_responsable, id_candidato, id_responsable, parentesco, es_principal')
      .maybeSingle();

    if (errorRelacion) {
      if (insertedResponsable?.id_responsable) {
        await supabaseAdmin
          .from('responsables')
          .delete()
          .eq('id_responsable', insertedResponsable.id_responsable);
      }
      if (insertedCandidato?.id_candidato) {
        await supabaseAdmin.from('candidatos').delete().eq('id_candidato', insertedCandidato.id_candidato);
      }
      if (createdObraId) {
        await supabaseAdmin.from('obras_sociales').delete().eq('id_obra_social', createdObraId);
      }
      throw errorRelacion;
    }

    return res.status(201).json({
      success: true,
      data: {
        candidato: insertedCandidato,
        responsable: insertedResponsable,
        relacion: relacionData,
      },
    });
  } catch (error) {
    console.error('Error en enviarFormularioEntrevista:', error);

    const msg = error?.message || error?.msg || JSON.stringify(error);
    let status = 500;
    const lower = String(msg).toLowerCase();
    if (lower.includes('duplicate') || lower.includes('unique') || lower.includes('already exists') || error?.code === '23505') {
      status = 409;
    }

    return res.status(status).json({
      success: false,
      message: 'Error al crear candidato',
      error: msg,
    });
  }
};

module.exports = { enviarFormularioEntrevista };
