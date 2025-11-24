const express = require('express');
const router = express.Router();
const {
	handleGetPagos,
	handleUpdatePago,
	handleGetPagosDashboardDeudas,
} = require('../controllers/pagoController');

// Definir las rutas para los pagos
router.get('/pagos/dashboard/deudas', handleGetPagosDashboardDeudas);
router.get('/pagos', handleGetPagos);
router.put('/pagos/:id', handleUpdatePago);

module.exports = router;
