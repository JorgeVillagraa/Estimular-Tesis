const express = require('express');
const router = express.Router();
const {
	handleGetTurnos,
	handleGetTurnoFormData,
	handleCreateTurno,
	handleUpdateTurno,
	handleDeleteTurno,
	handleAutoScheduleEntrevista,
	handleCancelAutoScheduleEntrevista,
} = require('../controllers/turnoController');
const { authenticate } = require('../middlewares/auth');

// Definir las rutas para los turnos
router.get('/turnos/form-data', authenticate, handleGetTurnoFormData);
router.get('/turnos', authenticate, handleGetTurnos);
router.post('/turnos', authenticate, handleCreateTurno);
router.put('/turnos/:id', authenticate, handleUpdateTurno);
router.delete('/turnos/:id', authenticate, handleDeleteTurno);
router.post('/turnos/auto-schedule', authenticate, handleAutoScheduleEntrevista);
router.post('/turnos/auto-schedule/cancel', authenticate, handleCancelAutoScheduleEntrevista);

module.exports = router;
