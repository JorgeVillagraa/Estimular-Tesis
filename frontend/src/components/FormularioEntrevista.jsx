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
          placeholder="Nombre y apellido del niño/a"
          required
        />
        <div className="entrevista__input-fecha">
          <input
            className="entrevista__input"
            type="date"
            name="fecha_nacimiento"
            placeholder="Fecha de nacimiento"
            required
          />
        </div>
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
        <button type="submit" className="entrevista__boton">
          Enviar
        </button>
      </form>
    </section>
  );
}