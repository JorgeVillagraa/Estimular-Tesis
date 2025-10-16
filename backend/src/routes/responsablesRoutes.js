const express = require('express');
const { buscarPorDni, listarResponsables } = require('../controllers/responsablesController');
const router = express.Router();

// GET /api/responsables?dni=44028630  -> busca por DNI
router.get('/', async (req, res) => {
    const { dni } = req.query;
    if (dni) return buscarPorDni(req, res);
    return listarResponsables(req, res);
});

module.exports = router;
