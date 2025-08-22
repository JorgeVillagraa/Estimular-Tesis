import React, { useState } from 'react';
import '../styles/FormularioEntrevista.css';

const obrasSociales = [
  'OSDE',
  'Swiss Medical',
  'Galeno',
  'Medicus',
  'Hospital Italiano',
  'No posee',
];

export default function FormularioEntrevista() {
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    obraSocial: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí podrías enviar los datos al backend
    alert('Datos enviados correctamente');
  };

  return (
    <div className="formulario-container">
      <h2>Formulario de Entrevista</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre">Nombre completo</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <label htmlFor="dni">DNI</label>
        <input
          type="text"
          id="dni"
          name="dni"
          value={form.dni}
          onChange={handleChange}
          required
        />

        <label htmlFor="telefono">Teléfono</label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          required
        />

        <label htmlFor="obraSocial">Obra Social</label>
        <select
          id="obraSocial"
          name="obraSocial"
          value={form.obraSocial}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una opción</option>
          {obrasSociales.map((obra, idx) => (
            <option key={idx} value={obra}>{obra}</option>
          ))}
        </select>

        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
