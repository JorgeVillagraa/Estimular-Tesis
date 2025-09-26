import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificacionProvider } from './context/NotificacionContext';

import Landing from './pages/Landing';
import Entrevista from './pages/Entrevista';
import Turnos from './pages/Turnos';

function App() {
  const loggedInProfesionalId = 1; // Hardcoded for demonstration

  return (
    <NotificacionProvider loggedInProfesionalId={loggedInProfesionalId}>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<Entrevista />} />
          <Route path="/turnos" element={<Turnos />} />
        </Routes>
      </Router>
    </NotificacionProvider>
  );
}

export default App;

