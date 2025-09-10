import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

import Landing from './pages/Landing';
import Entrevista from './pages/Entrevista';
import Login from './pages/Login';
function App() {

  return (
    <div>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<Entrevista />} />
          <Route path ="/login" element={<Login />} />
        </Routes>
      </Router>
    </div>
   
  )
}

export default App
