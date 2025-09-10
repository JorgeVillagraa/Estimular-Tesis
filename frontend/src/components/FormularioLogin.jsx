import React, { useState } from 'react'
import '../styles/FormularioLogin.css'

const FormularioLogin = () => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = (e) => {
    e.preventDefault()
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="entrevista__formulario">
      <div className="formulario-login-box">
        <h1 className="formulario-login-title">Login</h1>
        <p className="formulario-login-subtitle">Ingresa los datos de tu cuenta</p>
        <form>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="formulario-login-input"
          />
          <div className="PadreBotonMostrarContraseña">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="formulario-login-input"
              style={{ paddingRight: "40px" }}
            />
            <button className='BotonMostrarContraseña'
              onClick={togglePassword}
              tabIndex={-1}
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="formulario-login-olvidaste">
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
          <button
            type="submit"
            className="formulario-login-boton"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default FormularioLogin