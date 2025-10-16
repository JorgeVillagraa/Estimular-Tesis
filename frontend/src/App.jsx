import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Entrevista from "./pages/Entrevista";
import DashboardLayout from "./layouts/DashboardLayout";
import CandidatosEntrevista from "./pages/CandidatosEntrevista";
import EntrevistaPage from "./pages/Entrevista";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<Entrevista />} />
          <Route
            path="/dashboard/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div style={{ padding: 24 }}>Bienvenido al Dashboard</div>
                    }
                  />
                  <Route path="candidatos" element={<CandidatosEntrevista />} />
                  <Route
                    path="usuarios"
                    element={
                      <div style={{ padding: 24 }}>Usuarios (placeholder)</div>
                    }
                  />
                  <Route
                    path="profesionales"
                    element={
                      <div style={{ padding: 24 }}>
                        Profesionales (placeholder)
                      </div>
                    }
                  />
                  <Route
                    path="entrevistas"
                    element={
                      <div style={{ padding: 24 }}>
                        Listado de entrevistas (placeholder)
                      </div>
                    }
                  />
                  <Route
                    path="obras-sociales"
                    element={
                      <div style={{ padding: 24 }}>
                        Obras sociales (placeholder)
                      </div>
                    }
                  />
                  <Route
                    path="turnos"
                    element={
                      <div style={{ padding: 24 }}>Turnos (placeholder)</div>
                    }
                  />
                  <Route
                    path="pacientes"
                    element={
                      <div style={{ padding: 24 }}>Pacientes (placeholder)</div>
                    }
                  />
                  <Route
                    path="responsables"
                    element={
                      <div style={{ padding: 24 }}>
                        Responsables (placeholder)
                      </div>
                    }
                  />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
