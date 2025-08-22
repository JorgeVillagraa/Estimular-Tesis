import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

import Landing from './pages/Landing';
import FormularioEntrevista from './pages/FormularioEntrevista';
import './styles/App.css'; 

function App() {

  return (
    <div>
      <Router>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/formulario-entrevista" element={<FormularioEntrevista />} />
          

        </Routes>
      </Router>
    </div>
   
  )
}

export default App
