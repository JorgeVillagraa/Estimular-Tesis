// backend/controllers/contactController.js

const nodemailer = require('nodemailer');

require('dotenv').config();

// Configuración de transporte Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'TU_USUARIO_ETHEREAL',
    pass: process.env.SMTP_PASS || 'TU_PASSWORD_ETHEREAL',
  },
});

exports.sendContactEmail = async (req, res) => {
  const { nombre, apellido, email, servicio, comentario } = req.body;

  if (!nombre || !apellido || !email || !servicio) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {

    const mailOptions = {
      from: `Estimular Web <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'destino@ejemplo.com',
      subject: 'Nueva consulta desde el Footer',
      text: `Nombre: ${nombre} ${apellido}\nEmail: ${email}\nServicio: ${servicio}\nComentario: ${comentario}`,
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Consulta enviada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al enviar el correo.' });
  }
};
