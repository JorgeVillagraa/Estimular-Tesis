import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/CrearNino.css";
import API_BASE_URL from "../constants/api";

const initialForm = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
};

export default function NuevoResponsableModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const nombreInputRef = useRef(null);

  useEffect(() => {
    nombreInputRef.current?.focus();
  }, []);

  const handleChange = (field) => (event) => {
    const value = field === "dni"
      ? event.target.value.replace(/\D/g, "")
      : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.nombre.trim()) {
      return "El nombre es obligatorio";
    }
    if (!form.apellido.trim()) {
      return "El apellido es obligatorio";
    }
    if (form.dni && form.dni.trim().length < 6) {
      return "El DNI debe tener al menos 6 dígitos";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "El email ingresado no es válido";
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const error = validate();
    if (error) {
      Swal.fire({ icon: "error", title: "Datos incompletos", text: error });
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
    };
    if (form.dni.trim()) {
      const dniNumber = Number(form.dni.trim());
      if (Number.isNaN(dniNumber)) {
        Swal.fire({ icon: "error", title: "DNI inválido", text: "El DNI debe contener solo números" });
        return;
      }
      payload.dni = dniNumber;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/responsables`, payload);
      const creado = response?.data?.data;
      setForm(initialForm);
      onSuccess?.(creado);
    } catch (err) {
      console.error("Error creando responsable:", err);
      const message = err?.response?.data?.message || "No se pudo crear el responsable";
      Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    if (loading) return;
    onClose?.();
    setForm(initialForm);
  };

  return (
    <div className="crear-overlay" onClick={close}>
      <div className="crear-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className="crear-close" onClick={close} aria-label="Cerrar">&times;</button>
        <h2>Nuevo responsable</h2>
        <p className="muted">Completa los datos para registrar a un nuevo tutor o responsable dentro del sistema.</p>
        <form className="crear-step" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Nombre
              <input
                ref={nombreInputRef}
                type="text"
                value={form.nombre}
                onChange={handleChange("nombre")}
                placeholder="Ej: Ana"
                required
              />
            </label>
            <label>
              Apellido
              <input
                type="text"
                value={form.apellido}
                onChange={handleChange("apellido")}
                placeholder="Ej: Pérez"
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              DNI (opcional)
              <input
                type="text"
                value={form.dni}
                onChange={handleChange("dni")}
                placeholder="Solo números"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </label>
            <label>
              Teléfono (opcional)
              <input
                type="tel"
                value={form.telefono}
                onChange={handleChange("telefono")}
                placeholder="Ej: 351 555 1234"
              />
            </label>
          </div>
          <label>
            Email (opcional)
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="correo@ejemplo.com"
            />
          </label>
          <div className="crear-actions">
            <button type="button" className="btn outline" onClick={close} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Guardando..." : "Crear responsable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
