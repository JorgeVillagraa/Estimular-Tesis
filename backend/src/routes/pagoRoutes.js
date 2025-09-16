const express = require('express');
const router = express.Router();
const { handleGetPagos, handleUpdatePago } = require('../controllers/pagoController');

// Definir las rutas para los pagos
router.get('/pagos', handleGetPagos);
router.put('/pagos/:id', handleUpdatePago);

module.exports = router;
