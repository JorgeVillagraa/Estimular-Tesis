// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../src/controllers/contactControllerler');

// Ruta para recibir el formulario del footer
router.post('/contact', sendContactEmail);

module.exports = router;
