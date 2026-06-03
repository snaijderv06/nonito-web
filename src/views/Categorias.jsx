import React, { useState, useEffect } from "react"; 
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../Database/supabaseconfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Importación de componentes
import ModalRegistroCategoria from "../components/Categorias/modalRegistroCategoria";
import NotificacionOperacion from "../components/NotificacionOperacion";
import TablaCategorias from "../components/Categorias/TablaCategorias";
import TarjetaCategoria from "../components/Categorias/TarjetaCategoria"; 
import ModalEdicionCategoria from "../components/Categorias/modalEdicionCategoria"; 
import ModalEliminacionCategoria from "../components/Categorias/modalEliminacionCategoria";
import CuadroBusquedas from "../components/Busquedas/CuadroBusquedas";
import Paginacion from "../components/Ordenamiento/Paginacion";
import ModalEnvioCorreoCategorias from "../components/Categorias/ModalEnvioCorreoCategorias";
import emailjs from '@emailjs/browser';

const Categorias = () => {
  // --- Estados ---
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(5);
  const [paginaActual, establecerPaginaActual] = useState(1);
  
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState({
    id_categoria: "",
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre_categoria: "",
    descripcion_categoria: "",
  });

  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  // --- Lógica de Carga ---

  const categoriasPaginadas = categoriasFiltradas.slice(
  (paginaActual - 1) * registrosPorPagina,
  paginaActual * registrosPorPagina
   );

  useEffect(() => {
  if (!textoBusqueda.trim()) {
    setCategoriasFiltradas(categorias);
  } else {
    const textoLower = textoBusqueda.toLowerCase().trim();
    const filtradas = categorias.filter(
      (cat) =>
        cat.nombre_categoria.toLowerCase().includes(textoLower) ||
        (cat.descripcion_categoria &&
          cat.descripcion_categoria.toLowerCase().includes(textoLower))
    );
    setCategoriasFiltradas(filtradas);
  }
}, [textoBusqueda, categorias]);
  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("Categorias") 
        .select("*")
        .order("id_categoria", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar:", err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // --- Manejo de Modales ---
  const abrirModalEdicion = (categoria) => {
    setCategoriaEditar({
      id_categoria: categoria.id_categoria,
      nombre_categoria: categoria.nombre_categoria,
      descripcion_categoria: categoria.descripcion_categoria,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalEliminacion(true);
  };

  // --- Manejo de Inputs ---
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
  const { name, value } = e.target;
  setCategoriaEditar((prev) => ({
    ...prev,
    [name]: value,
  }));
};
  
   const manejarBusqueda = (e) => {
  setTextoBusqueda(e.target.value);
};

  // --- Operaciones CRUD ---
  const agregarCategoria = async () => {
    try {
      if (!nuevaCategoria.nombre_categoria.trim() || !nuevaCategoria.descripcion_categoria.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("Categorias").insert([nuevaCategoria]);
      if (error) throw error;

      setToast({ 
        mostrar: true, 
        mensaje: `Categoría "${nuevaCategoria.nombre_categoria}" registrada exitosamente.`, 
        tipo: "exito" 
      });
      
      setNuevaCategoria({ nombre_categoria: "", descripcion_categoria: "" });
      setMostrarModal(false);
      cargarCategorias();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al registrar la categoría.", tipo: "error" });
    }
  };

  const actualizarCategoria = async () => {
    try {
      if (!categoriaEditar.nombre_categoria.trim() || !categoriaEditar.descripcion_categoria.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      setMostrarModalEdicion(false);

      const { error } = await supabase
        .from("Categorias")
        .update({
          nombre_categoria: categoriaEditar.nombre_categoria,
          descripcion_categoria: categoriaEditar.descripcion_categoria,
        })
        .eq("id_categoria", categoriaEditar.id_categoria);

      if (error) throw error;

      await cargarCategorias();
      setToast({
        mostrar: true,
        mensaje: `Categoría "${categoriaEditar.nombre_categoria}" actualizada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar la categoría.", tipo: "error" });
    }
  };

  const eliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    try {
      setMostrarModalEliminacion(false);

      const { error } = await supabase
        .from("Categorias")
        .delete()
        .eq("id_categoria", categoriaAEliminar.id_categoria);

      if (error) throw error;

      await cargarCategorias();
      setToast({
        mostrar: true,
        mensaje: `Categoría "${categoriaAEliminar.nombre_categoria}" eliminada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar la categoría.", tipo: "error" });
    }
  };

  const generarPDFCategoria = (categoria) => {

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reporte de Categoría", 14, 20);

    // Línea decorativa
    doc.line(14, 25, 195, 25);

    // Información de la categoría
    doc.setFontSize(12);

    autoTable(doc, {
      startY: 35,
      head: [["Campo", "Valor"]],
      body: [
        ["ID", categoria.id_categoria],
        ["Nombre", categoria.nombre_categoria],
        ["Descripción", categoria.descripcion_categoria],
      ],
    });

    // Descargar PDF
    doc.save(`categoria_${categoria.id_categoria}.pdf`);
  };

  // Inicializar EmailJS
useEffect(() => {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
}, []);

const abrirModalCorreo = () => {
  setEmailDestino("");
  setMostrarModalCorreo(true);
};

const formatearCategoriasParaCorreo = () => {
  if (categorias.length === 0) return "No hay categorías registradas.";

  let texto = `LISTADO DE CATEGORÍAS\n\n`;
  texto += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
  texto += `Total de categorías: ${categorias.length}\n\n`;

  categorias.forEach((cat, index) => {
    texto += `${index + 1}. ${cat.nombre_categoria}\n`;

    if (cat.descripcion_categoria) {
      texto += ` Descripción: ${cat.descripcion_categoria}\n`;
    }

    texto += `\n`;
  });

  return texto;
};

const enviarCorreoCategorias = () => {
  if (!emailDestino.trim()) {
    setToast({
      mostrar: true,
      mensaje: "Por favor ingresa un correo destino.",
      tipo: "advertencia",
    });
    return;
  }

  setEnviandoCorreo(true);

  const mensaje = formatearCategoriasParaCorreo();

  const templateParams = {
    to_name: "Administrador",
    user_email: emailDestino,
    message: mensaje,
    fecha_envio: new Date().toLocaleDateString("es-NI"),
  };

  emailjs
    .send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    )
    .then(() => {
      setToast({
        mostrar: true,
        mensaje: "Correo enviado correctamente.",
        tipo: "exito",
      });

      setMostrarModalCorreo(false);
      setEmailDestino("");
    })
    .catch((error) => {
      console.error("Error EmailJS:", error);

      setToast({
        mostrar: true,
        mensaje: "Error al enviar el correo.",
        tipo: "error",
      });
    })
    .finally(() => {
      setEnviandoCorreo(false);
    });
};

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0 fw-bold">
            <i className="bi-bookmark-plus-fill me-2"></i> Categorías
          </h3>

        </Col>
         <Col xs={2} sm={2} md={2} lg={2} className="text-end">
          <Button variant="primary" onClick={abrirModalCorreo} size="md">
            <i className="bi bi-envelope"></i>
            <span className="d-none d-lg-inline ms-2">Enviar por Correo</span>
          </Button>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} variant="primary">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Categoría</span>
          </Button>
        </Col>
      </Row>

      <hr />
            {/* Cuadro de búsqueda debajo de la línea divisoria */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre o descripción..."
          />
        </Col>
      </Row>

      {/* Mensaje de no coincidencias solo cuando hay búsqueda y no hay resultados */}
      {!cargando && textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              No se encontraron categorias que coincidan con "{textoBusqueda}".
            </Alert>
          </Col>
        </Row>
      )}

      
        {/* Lista de categorías filtradas */}
        {!cargando && categoriasFiltradas.length > 0 && (
          <Row>
            <Col xs={12} sm={12} md={12} className="d-lg-none">
              <TarjetaCategoria
                categorias={categoriasPaginadas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
              />
            </Col>

          <Col lg={12} className="d-none d-lg-block">
            <TablaCategorias
              categorias={categoriasPaginadas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              generarPDFCategoria={generarPDFCategoria}
            />
          </Col>
        </Row>

      )}

      {/* MODALES */}
      <ModalRegistroCategoria
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaCategoria={nuevaCategoria}
        manejoCambioInput={manejoCambioInput}
        agregarCategoria={agregarCategoria}
      />

      <ModalEdicionCategoria
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        categoriaEditar={categoriaEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarCategoria={actualizarCategoria}
      />

      <ModalEliminacionCategoria
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarCategoria={eliminarCategoria}
        categoria={categoriaAEliminar}
      />

      <ModalEnvioCorreoCategorias
        mostrarModalCorreo={mostrarModalCorreo}
        setMostrarModalCorreo={setMostrarModalCorreo}
        emailDestino={emailDestino}
        setEmailDestino={setEmailDestino}
        enviandoCorreo={enviandoCorreo}
        enviarCorreoCategorias={enviarCorreoCategorias}
        totalCategorias={categorias.length}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      {/* Paginación */}
      {categoriasFiltradas.length > 0 && (
    <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={categoriasFiltradas.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />

      

)}
    </Container>
  );
};

export default Categorias;