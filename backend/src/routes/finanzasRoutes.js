const { Router } = require('express');
const { getResumenMensual } = require('../controllers/finanzasController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = Router();

// GET /api/finanzas/resumen-mensual?anio=2025 - Admin, recepción y profesionales con vista de pagos
router.get(
	'/finanzas/resumen-mensual',
	authenticate,
	authorize(['admin', 'recepcion', 'profesional']),
	getResumenMensual
);

module.exports = router;

