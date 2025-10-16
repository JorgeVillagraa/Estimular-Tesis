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
          to="/dashboard/usuarios"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          👤 Usuarios
        </NavLink>
        <NavLink
          to="/dashboard/profesionales"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          🧑‍⚕️ Profesionales
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
        <NavLink
          to="/dashboard/turnos"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          📅 Turnos
        </NavLink>
        <NavLink
          to="/dashboard/pacientes"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          🧾 Pacientes
        </NavLink>
        <NavLink
          to="/dashboard/responsables"
          className={({ isActive }) =>
            isActive ? "sd-link active" : "sd-link"
          }
        >
          🧑‍👩‍👧 Responsables
        </NavLink>
      </nav>

      <div className="sd-footer">
        <button className="sd-logout">Cerrar sesión</button>
      </div>
    </aside>
  );
}
