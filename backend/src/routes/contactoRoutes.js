// backend/routes/contactRoutes.js
const express = require('express');

const { enviarEmail } = require('../controllers/contactoController');

const router = express.Router();

// Ruta pública para recibir el formulario de contacto de la landing
// No requiere autenticación porque la usan potenciales pacientes/consultas externas.
router.post('/enviar-mail', enviarEmail);

module.exports = router;
