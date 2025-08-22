import '../styles/Footer.css';

export default function Footer() {

  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} Estimular. Todos los derechos reservados.</p>
    </footer>
  );
}
