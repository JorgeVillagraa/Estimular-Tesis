const express = require('express');
const { listEquipo, crearIntegrante, editarIntegrante, editarSecretario, borrarIntegrante, restablecerContrasena } = require('../controllers/equipoController');
const router = express.Router();

router.get('/', listEquipo);
router.post('/', crearIntegrante);
router.put('/secretarios/:id_secretario', editarSecretario);
router.put('/:id_profesional', editarIntegrante);
router.delete('/:id_profesional', borrarIntegrante);
router.post('/:id_usuario/reset-password', restablecerContrasena);

module.exports = router;
