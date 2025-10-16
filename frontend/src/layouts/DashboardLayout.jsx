import React from "react";
import SidebarDashboard from "../components/SidebarDashboard";
import "../styles/DashboardLayout.css";

export default function DashboardLayout({ children, title }) {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" aria-label="Navegación principal">
        <SidebarDashboard />
      </aside>

      <main className="dashboard-main" role="main">
        {title && (
          <div className="dashboard-title">
            <h2>{title}</h2>
          </div>
        )}
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
