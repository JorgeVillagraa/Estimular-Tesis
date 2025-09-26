const express = require('express');
const router = express.Router();
const { handleGetNotificaciones } = require('../controllers/notificacionController');

// Definir la ruta para obtener notificaciones
router.get('/notificaciones', handleGetNotificaciones);

module.exports = router;
