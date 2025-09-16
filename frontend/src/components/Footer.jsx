import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import instagramIcon from "../assets/logo_instagram.jpg";
import facebookIcon from "../assets/logo_facebook.jpg";

//  React Icons
import {FaPhoneAlt} from "react-icons/fa";


import { profesionales } from "../constants/profesionales";

import "../styles/Footer.css";

export default function Footer() {

  const {telefono} = profesionales[0];

  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    servicio: "",
    comentario: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await axios.post("http://localhost:3001/api/contact", form);

      if (res.data.success) {
        setStatus({ success: true, message: res.data.message });
        setForm({
          nombre: "",
          apellido: "",
          email: "",
          servicio: "",
          comentario: "",
        });
      } else {
        setStatus({ success: false, message: res.data.message });
      }
    } catch (err) {
      setStatus({
        success: false,
        message: err.response?.data?.message || "Error al enviar la consulta.",
      });
    }
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-content">

        {/* ================================= */}
        <div className="footer-left">
          <button className="footer-contact-btn">CONTACTO</button>
          <p className="footer-desc">
            Para más información, consultas o turnos, te asesoramos ante cualquier
            inquietud, nos podés encontrar en :
          </p>
          
          <div className="footer-phone-row">
             <div className="footer-social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon fb"
              aria-label="Facebook"
            >
              <img
                src={facebookIcon}
                alt="Facebook"
                className="footer-img-icon"
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon ig"
              aria-label="Instagram"
            >
              <img
                src={instagramIcon}
                alt="Instagram"
                className="footer-img-icon"
              />
            </a>
          </div>
            <span><FaPhoneAlt/></span>
            <span className="footer-phone">{telefono} </span>
            
          </div>
         

         {/* ========================== */}
          <section aria-labelledby="footer-preguntas">
            <h2 id="footer-preguntas-titulo">PREGUNTAS FRECUENTES</h2>

            <div className="footer-preguntas-lista">
              <details className="footer-detalles">
                <summary className="footer-pregunta">
                   ¿Qué tipos de servicios ofrecen?
                </summary>
                <p className="footer-respuesta">
                  Ofrecemos evaluación diagnóstica, terapia individual por área y talleres grupales.
                </p>
              </details>

              <details className="footer-detalles">
                <summary className="footer-pregunta">
                  ¿Cómo solicito la primera entrevista?
                </summary>
                <p className="footer-respuesta">
                  Podes solicitar a traves de un formulario con datos basicos del pacientes y responsable.
                  <div className="footer-enlace-entrevista">
                     <Link to="/formulario-entrevista">EN ESTE ENLACE</Link>
                  </div>
                 
                  El equipo se pondrá en contacto para coordinar la primera entrevista.
                </p>
              </details>

              <details className="footer-detalles">
                <summary className="footer-pregunta">
                  ¿Qué servicios ofrecen?
                </summary>
                <p className="footer-respuesta">
                  Ofrecemos evaluación diagnóstica, terapia individual, y
                  programas personalizados según las necesidades del niño/a.
                </p>
              </details>

              <details className="footer-detalles">
                <summary className="footer-pregunta">
                  ¿Aceptan obras sociales?
                </summary>
                <p className="footer-respuesta">
                  Sí, trabajamos con varias obras sociales. Consultanos para más
                  detalles.
                </p>
              </details>

              <details className="footer-detalles">
                <summary className="footer-pregunta">
                  ¿Dónde están ubicados?
                </summary>
                <p className="footer-respuesta">
                  Estamos ubicados en Las Piedras 312, en el centro de la ciudad,
                  con fácil acceso en transporte público.
                </p>
              </details>
            </div>
          </section>
          {/* ========================== */}
        </div>

        {/* ================================= */}
        <div className="footer-right">
          <form className="footer-form" onSubmit={handleSubmit}>
            <div className="footer-form-row">
              <div>
                <label className="footer-form-label">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder= "Juan"
                  required
                />
              </div>
              <div>
                <label className="footer-form-label">Apellidos</label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder= "Perez"  
                  required
                />
              </div>
            </div>
            <label className="footer-form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juanperez@gmail.com"
              required
            />
            <label className="footer-form-label">Interesado en</label>
            <select
              name="servicio"
              value={form.servicio}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="evaluacion">Evaluación diagnóstica inicial</option>
              <option value="terapia">Terapia individual</option>
              <option value="disponiblidad">
                Consultar disponibilidad de turnos
              </option>
              <option value="otros">Otros...</option>
            </select>
            <label className="footer-form-label">Comentario</label>
            <textarea
              name="comentario"
              value={form.comentario}
              onChange={handleChange}
              rows={4}
              placeholder="Hola estoy interesado en..."
            />
            <p style={{color:"red", textAlign:"right"}} className=" maximo-caracteres-label"> Max 250 caracteres </p>
            <button type="submit" className="footer-form-btn">
              Enviar
            </button>
            {status && (
              <div
                className={status.success ? "success-message" : "error-message"}
              >
                {status.message}
              </div>
            )}
          </form>
        </div>
        {/* ================================= */}

      </div>
      <div className="footer-bottom">
        <p>© {currentYear} Estimular. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
