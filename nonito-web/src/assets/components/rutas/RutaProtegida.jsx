import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
    // Aquí debe ir tu lógica de si el usuario está logueado o no
    const usuario = localStorage.getItem("usuario-supabase");

    if (!usuario) {
        // Si no hay usuario, lo manda al login
        return <Navigate to="/login" />;
    }

    // Si hay usuario, muestra la página que quería ver
    return children;
};

// ESTA ES LA LÍNEA QUE TE FALTA:
export default RutaProtegida;