import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

import Landing from './pages/Landing';
import Entrevista from './pages/Entrevista';

function App() {

  return (
    <div>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<Entrevista />} />
        </Routes>
      </Router>
    </div>
   
  )
}

export default App
