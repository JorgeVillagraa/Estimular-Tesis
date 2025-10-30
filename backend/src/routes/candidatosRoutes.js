const express = require('express');
const { getCandidatos, editarCandidato, borrarCandidato, setPrincipalResponsable } = require('../controllers/candidatosController');
const router = express.Router();

// Listar candidatos con responsables y estado
router.get('/', getCandidatos);
// Editar candidato
router.put('/:id_candidato', editarCandidato);
// Establecer responsable principal
router.put('/:id_candidato/responsable', setPrincipalResponsable);
// Borrar candidato
router.delete('/:id_candidato', borrarCandidato);


module.exports = router;
