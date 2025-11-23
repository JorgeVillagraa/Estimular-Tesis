const { Router } = require('express');
const { getResumenMensual } = require('../controllers/finanzasController');

const router = Router();

// GET /api/finanzas/resumen-mensual?anio=2025
router.get('/finanzas/resumen-mensual', getResumenMensual);

module.exports = router;

