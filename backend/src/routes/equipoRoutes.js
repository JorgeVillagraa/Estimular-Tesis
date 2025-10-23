const express = require('express');
const { listEquipo, crearIntegrante, editarIntegrante, borrarIntegrante } = require('../controllers/equipoController');
const router = express.Router();

router.get('/', listEquipo);
router.post('/', crearIntegrante);
router.put('/:id_profesional', editarIntegrante);
router.delete('/:id_profesional', borrarIntegrante);

module.exports = router;
