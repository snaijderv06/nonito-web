import { Container } from "react-bootstrap";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Encabezado from "./components/navegacion/Encabezado";

import Inicio from "./views/Inicio.jsx";
import Categorias from "./views/Categorias.jsx";
import Catalogo from "./views/Catalogo.jsx";
import Productos from "./views/Productos.jsx";
import Login from "./views/Login.jsx";
import RutaProtegida from './components/rutas/RutaProtegida';
import Pagina404 from './views/Pagina404';

import './App.css'

const App = () => {
return (
  <Router>
    <Encabezado />
    <main className="margen-superior-main">
      <Container fluid className="px-4"> {/* <--- AGREGA ESTA LÍNEA */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />
          <Route path="*" element={<Pagina404 />} />
        </Routes>
      </Container> {/* <--- CIERRA EL CONTAINER */}
    </main>
  </Router>
);

}

export default App;