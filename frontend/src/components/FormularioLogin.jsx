import React, { useState } from 'react'
import '../styles/FormularioLogin.css'

const FormularioLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const togglePassword = (e) => {
    e.preventDefault()
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: email,
          contrasena: password
        })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Bienvenido')
        // Aquí puedes redirigir o guardar el usuario si lo necesitas
      } else {
        alert(data.error || 'Credenciales incorrectas')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  return (
    <div className="entrevista__formulario">
      <div className="formulario-login-box">
        <h1 className="formulario-login-title">Login</h1>
        <p className="formulario-login-subtitle">Ingresa los datos de tu cuenta</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="DNI"
            className="formulario-login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div className="PadreBotonMostrarContraseña">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="formulario-login-input"
              style={{ paddingRight: "40px" }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
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