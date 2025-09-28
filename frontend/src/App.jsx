import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Entrevista from "./pages/Entrevista";
import CandidatosEntrevista from "./pages/CandidatosEntrevista";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<Entrevista />} />
          <Route path="/candidatos-entrevista" element={<CandidatosEntrevista />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
