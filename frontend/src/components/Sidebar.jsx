import logoEstimular from "../assets/logo_estimular.png";
import InformacionContacto from '../components/InformacionContacto';
import "../styles/Sidebar.css"
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  altLogo = "Logo Estimular",
  slogan = "Si quieres ir rápido camina solo, si quieres llegar lejos ve acompañado"
}) {
  const navigate = useNavigate();

  return (
    <div className="barra-lateral" role="complementary" aria-label="Barra lateral Estimular">
      {logoEstimular ? (
        <img
          src={logoEstimular}
          alt={altLogo}
          className="barra-lateral__logo"
        />
      ) : (
        <div className="barra-lateral___logo--placeholder" aria-hidden="true">
          ESTIMULAR
        </div>
      )}
      <div className="barra-lateral__separador" />
      <div className="barra-lateral__slogan" aria-live="polite">
        <q>{slogan}</q>
      </div>

      <div className="barra-lateral__cta">
        <button
          className="btn-logout"
          type="button"
          aria-label="Cerrar sesión"
          onClick={() => {
            localStorage.clear();
            navigate("/");   // <- redirige a la página de inicio
          }}
        >
          Logout
        </button>
      </div>
      <footer className="barra-lateral__footer">
        <InformacionContacto />
      </footer>
    </div>
  );
}
