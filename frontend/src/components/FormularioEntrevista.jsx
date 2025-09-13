import "../styles/FormularioEntrevista.css";

export default function FormularioEntrevista() {
  return (
    <section className="entrevista__formulario">
      <h1 className="entrevista__titulo">Primera Entrevista</h1>
      <p className="entrevista__subtitulo">
        Por favor complete el siguiente formulario<br />
        con la información del niño/a y del responsable.
      </p>
      <form className="entrevista__form">
        <input
          className="entrevista__input"
          type="text"
          name="nombre_nino"
          placeholder="Nombre completo del niño/a"
          required
        />
        {/* <div className="entrevista__input-fecha">
          <input
            className="entrevista__input"
            type="date"
            name="fecha_nacimiento"
            placeholder="Fecha de nacimiento del niño/a en dia/mes/año"
            required
          />
        </div> */
        <div className="entrevista__input-fecha">
          <input
            className="entrevista__input"
            type="text"
            name="fecha_nacimiento"
            placeholder="dia"
            required
          />
                    <input
            className="entrevista__input"
            type="text"
            name="fecha_nacimiento"
            placeholder="mes"
            required
          />
                    <input
            className="entrevista__input"
            type="text"
            name="fecha_nacimiento"
            placeholder="ano"
            required
          />
        </div>
        }
        <input
          className="entrevista__input"
          type="text"
          name="nombre_responsable"
          placeholder="Nombre del responsable"
          required
        />
        <input
          className="entrevista__input"
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          required
        />
        <input
          className="entrevista__input"
          type="text"
          name="motivo"
          placeholder="Motivo de consulta"
          required
        />

        <div className="entrevista__terminos-container">
          <input
            className="entrevista__aceptar-terminos"
            id="aceptar_terminos"
            type="checkbox"
            name="aceptar_terminos"
            required
          />
        <label className="entrevista__label-terminos"
        onClick={(e) => {
          const checkbox = document.getElementById('aceptar_terminos');
          checkbox.checked = !checkbox.checked;
        }}
        
        
        
        
        
        
        >
          Acepto los términos y condiciones
        </label>

        </div>
      
      
        <button type="submit" className="entrevista__boton">
          Enviar
        </button>
      </form>
    </section>
  );
}