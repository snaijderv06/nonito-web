import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({
  productos,
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const loading = !productos || productos.length === 0;

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(
      (cat) => String(cat.id_categoria) === String(idCategoria)
    );

    return categoria ? categoria.nombre_categoria : "Sin categoría";
  };

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando productos...</h4>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <Table striped borderless hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th className="d-none d-md-table-cell">Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.id_producto}</td>

                <td>
                  {producto.url_imagen ? (
                    <img
                      src={producto.url_imagen}
                      alt={producto.nombre_producto}
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <i className="bi bi-image text-muted fs-4"></i>
                  )}
                </td>

                <td>{producto.nombre_producto}</td>

                <td>{obtenerNombreCategoria(producto.categoria_producto)}</td>

                <td>C$ {Number(producto.precio_venta).toFixed(2)}</td>

                <td className="d-none d-md-table-cell">
                  {producto.descripcion_producto || "Sin descripción"}
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="m-1"
                    onClick={() => abrirModalEdicion(producto)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(producto)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaProductos;