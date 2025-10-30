const express = require("express");
const {
  registrarUsuario,
  loginUsuario,
  primerRegistro,
  actualizarPerfil,
  obtenerPerfilActual,
} = require("../controllers/loginController");

const router = express.Router();

// Soporte legacy: POST /api/login
router.post("/", loginUsuario);

// Rutas nuevas
router.post("/login", loginUsuario);
router.post("/register", registrarUsuario);
router.post("/primer-registro", primerRegistro);
router.put("/perfil", actualizarPerfil);
router.get("/me", obtenerPerfilActual);

module.exports = router;