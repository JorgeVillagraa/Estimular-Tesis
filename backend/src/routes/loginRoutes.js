const express = require("express");

const { registrarUsuario, loginUsuario, primerRegistro, actualizarPerfil, obtenerPerfilActual } = require("../controllers/loginController");

const router = express.Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/primer-registro", primerRegistro);
router.put("/perfil", actualizarPerfil);
router.get("/me", obtenerPerfilActual);

module.exports = router;