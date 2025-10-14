import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/SidebarDashboard.css";

export default function SidebarDashboard() {
  return (
    <aside className="sd-sidebar" aria-label="Sidebar de navegación">
      <div className="sd-top">
        <div className="sd-logo">Estimular</div>
      </div>

      <nav className="sd-nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          🏠 Dashboard
        </NavLink>
        <NavLink
          to="/dashboard/candidatos"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          👥 Candidatos
        </NavLink>
        <NavLink
          to="/dashboard/entrevistas"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          📋 Entrevistas
        </NavLink>
        <NavLink
          to="/dashboard/obras-sociales"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          🏥 Obras sociales
        </NavLink>
      </nav>

      <div className="sd-footer">
        <button className="sd-logout">Cerrar sesión</button>
      </div>
    </aside>
  );
}
