const express = require('express');
const router = express.Router();
const { listTurnos, updateTurno, assignTurnosForCandidato } = require('../controllers/turnosController');

// Listar turnos con filtros (?estado=pendiente&disponible=true&nino_id=...)
router.get('/', listTurnos);

// Actualizar turno (asignar/quitar niño, cambiar estado)
router.put('/:id', updateTurno);

// (Opcional) Crear/autoasignar turnos para un candidato
router.post('/assign', assignTurnosForCandidato);

module.exports = router;
