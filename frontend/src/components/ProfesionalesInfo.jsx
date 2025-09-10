import { profesionales } from "../constants/profesionales";
import "../styles/ProfesionalesInfo.css";

export default function ProfesionalesInfo({ onClose }) {


  const contactarProfesional = (id) => {
    return () => {

      // Busca el profesional por su ID
      const profesional = profesionales.find((p) => p.id === id);


      // Contactar el profesional con un mensaje pre-armado

      if (profesional) {
        const mensaje = `Hola ${profesional.nombre}, me gustaría contactarte para solicitar tus servicios de ${profesional.servicio}. ¿Podrías proporcionarme más información?`;

        // Formatea el número de teléfono (asegúrate de que esté en el formato correcto)
        const telefonoFormateado = "549" + profesional.telefono.replace(/\D/g, '');


        console.log(telefonoFormateado);

        // Crea el enlace de WhatsApp
        const enlaceWhatsApp = `https://wa.me/${telefonoFormateado}?text=${encodeURIComponent(mensaje)}`;


        // Abre el enlace en una nueva pestaña
        window.open(enlaceWhatsApp, '_blank');
        
      }
    }
  };


  return (
    <div className="service-profesionales service-profesionales--full">
      <button className="service-profesionales__close" onClick={onClose}>
        &times;
      </button>
      <h2 className="service-profesionales__title">Equipo Profesional</h2>
      <div className="service-profesionales__list">
        {profesionales.map((prof) => (
          <div onClick={contactarProfesional(prof.id)}key={prof.id} className="service-profesionales__item">
            <div className="profesional-foto-wrapper">
              <img
                src={prof.foto}
                alt={prof.nombre}
                className="service-profesionales__foto"
              />
            </div>
            <div className="service-profesionales__info">
              <h3>Lic. {prof.nombre}</h3>
              <p className="profesional-profesion">
                <span className="profesional-icon">🎓</span> {prof.profesion}
              </p>
              <p className="profesional-telefono">
                <span className="profesional-icon">📞</span> {prof.telefono}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
