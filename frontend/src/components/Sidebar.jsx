import React from "react";
import logoEstimular from "../assets/logo_estimular.png";
import "../styles/Sidebar.css";

export default function Sidebar() {
  return (
    <div className="barra-lateral">
      <aside className="barra-lateral__aside">
        <img
          src={logoEstimular}
          alt="Logo Estimular"
          className="barra-lateral__logo"
        />
        <h1 className="barra-lateral__marca">ESTIMULAR</h1>
        <h2 className="barra-lateral__frase">
          "Cada niño es un mundo por descubrir"
        </h2>
      </aside>
    </div>
  );
}