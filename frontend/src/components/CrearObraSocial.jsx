import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../constants/api";
import Swal from "sweetalert2";
import "../styles/CrearObraSocial.css";
import fallbackObraLogo from "../assets/logo_estimular.png";

const MAX_LOGO_SIZE_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

const sanitizeNombreObra = (value) => {
  if (!value) return "";
  return String(value)
    .normalize("NFC")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
};

const canonicalNombreObra = (value) =>
  sanitizeNombreObra(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "");

export default function CrearObraSocial({ onClose, estados = [], onCreated }) {
  const [nombre, setNombre] = useState("");
  const [obrasRegistradas, setObrasRegistradas] = useState([]);
  const [logoPreview, setLogoPreview] = useState(fallbackObraLogo);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const fileInputRef = useRef(null);

  const estadoOptions = useMemo(() => {
    const allowed = ["activa", "pendiente"];
    const mapa = estados
      .filter((e) => typeof e === "string" && e.toLowerCase() !== "todos")
      .reduce((acc, current) => {
        acc[current.toLowerCase()] = current;
        return acc;
      }, {});

    return allowed
      .map((estado) => mapa[estado] ?? estado)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [estados]);

  const [estado, setEstado] = useState(estadoOptions[0] || "pendiente");

  useEffect(() => {
    setEstado((prev) => {
      if (estadoOptions.length === 0) return "pendiente";
      if (estadoOptions.includes(prev)) return prev;
      return estadoOptions[0];
    });
  }, [estadoOptions]);

  useEffect(() => {
    let cancelado = false;
    const cargarObras = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/obras-sociales`, {
          params: { page: 1, pageSize: 500, estado: "todos" },
        });
        if (cancelado) return;
        const existentes = (res?.data?.data || [])
          .map((obra) => canonicalNombreObra(obra?.nombre_obra_social))
          .filter(Boolean);
        setObrasRegistradas(existentes);
      } catch (error) {
        console.error("No se pudieron cargar las obras sociales existentes", error);
      }
    };

    cargarObras();
    return () => {
      cancelado = true;
    };
  }, []);

  const clearLogoSelection = () => {
    setLogoDataUrl(null);
    setLogoPreview(fallbackObraLogo);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      clearLogoSelection();
      return;
    }
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "Formato inválido",
        text: "Seleccioná una imagen (PNG, JPG o WEBP).",
      });
      event.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      Swal.fire({
        icon: "warning",
        title: "Imagen demasiado grande",
        text: "Elegí una imagen de hasta 2.5 MB.",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setLogoDataUrl(result);
        setLogoPreview(result);
      }
    };
    reader.onerror = () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo leer el archivo seleccionado.",
      });
    };
    reader.readAsDataURL(file);
  };

  const manejarCambioNombre = (valor) => {
    const normalizado = valor ? String(valor).toUpperCase() : "";
    setNombre(normalizado);
  };

  const handleSave = async () => {
    const nombreSanitizado = sanitizeNombreObra(nombre);
    if (!nombreSanitizado) {
      Swal.fire({ icon: "warning", title: "Completa el nombre" });
      return;
    }

    const nombreCanonico = canonicalNombreObra(nombreSanitizado);
    if (nombreCanonico && obrasRegistradas.includes(nombreCanonico)) {
      Swal.fire({
        icon: "error",
        title: "Duplicado",
        text: "Ya existe una obra social registrada con ese nombre.",
      });
      return;
    }
    try {
      Swal.fire({
        title: "Creando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const payload = {
        nombre_obra_social: nombreSanitizado,
        estado,
      };
      if (logoDataUrl) payload.logo = logoDataUrl;
      await axios.post(`${API_BASE_URL}/api/obras-sociales`, payload);
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Creado",
        timer: 1200,
        showConfirmButton: false,
      });
      setObrasRegistradas((prev) =>
        nombreCanonico ? [...prev, nombreCanonico] : prev
      );
      setNombre("");
      clearLogoSelection();
      if (typeof onCreated === "function") onCreated();
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "No se pudo crear",
      });
    }
  };

  return (
    <div className="os-modal-overlay" onClick={onClose}>
      <div className="os-modal" onClick={(e) => e.stopPropagation()}>
        <button className="os-modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Nueva obra social</h2>
        <div className="os-modal-section">
          <h3>Datos</h3>
          <div className="os-modal-row justify-start">
            <div className="w-100">
              <label className="sr-only" htmlFor="os-nombre">
                Nombre
              </label>
              <input
                id="os-nombre"
                className="os-edit-input"
                type="text"
                placeholder="Nombre de la obra social"
                value={nombre}
                onChange={(e) => manejarCambioNombre(e.target.value)}
              />
            </div>
          </div>
          <div className="os-modal-row justify-start">
            <div className="w-100">
              <label className="sr-only" htmlFor="os-estado">
                Estado
              </label>
              <select
                id="os-estado"
                className="os-edit-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                {(estadoOptions.length ? estadoOptions : ["activa", "pendiente"]).map((es) => (
                  <option key={es} value={es}>
                    {es}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="os-modal-section">
          <h3>Logo (opcional)</h3>
          <div className="os-logo-preview">
            <img
              src={logoPreview}
              alt="Logo de la obra social"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackObraLogo;
              }}
            />
          </div>
          <label className="os-logo-upload">
            <span>Seleccioná una imagen (PNG/JPG/WEBP, máx. 2.5 MB)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoChange}
            />
          </label>
          <div className="os-logo-actions">
            <button
              type="button"
              className="os-btn os-clear-logo"
              onClick={clearLogoSelection}
              disabled={!logoDataUrl}
            >
              Quitar selección
            </button>
          </div>
        </div>

        <div className="os-row-actions justify-end">
          <button className="os-btn os-save" onClick={handleSave}>
            Guardar
          </button>
          <button className="os-btn os-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
