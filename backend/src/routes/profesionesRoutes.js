const express = require('express');
const { listProfesiones, adjustProfesionesPrecios } = require('../controllers/profesionesController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listProfesiones);
router.post('/ajustar-precios', authenticate, authorize(['admin', 'recepcion']), adjustProfesionesPrecios);

module.exports = router;
