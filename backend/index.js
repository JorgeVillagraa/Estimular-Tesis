const express = require('express');
const cors = require('cors');
require('dotenv').config();


const contactosRoutes = require('./src/routes/contactoRoutes');
const entrevistaRoutes = require('./src/routes/entrevistaRoutes');
const obrasSocRoutes = require('./src/routes/obrasSocRoutes');
const candidatosRoutes = require('./src/routes/candidatosRoutes');
const turnosRoutes = require('./src/routes/turnosRoutes');
const responsablesRoutes = require('./src/routes/responsablesRoutes');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Diagnóstico rápido de conexión a Supabase
try {
	const { testConnection } = require('./src/config/db');
	if (typeof testConnection === 'function') testConnection();
} catch (e) {
	console.warn('No se pudo ejecutar testConnection:', e.message);
}

// Rutas
app.use('/api/contact', contactosRoutes);
app.use('/api/entrevista', entrevistaRoutes);
app.use('/api/obras-sociales', obrasSocRoutes);
app.use('/api/candidatos', candidatosRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/responsables', responsablesRoutes);

app.listen(PORT, () => {
	console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

