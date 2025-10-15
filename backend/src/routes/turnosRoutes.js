const express = require('express');
const router = express.Router();
const { assignTurnosForCandidato } = require('../controllers/turnosController');

router.post('/assign', assignTurnosForCandidato);

module.exports = router;
