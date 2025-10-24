const express = require("express");

const { registrarUsuario, loginUsuario, primerRegistro } = require("../controllers/loginController");

const router = express.Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/primer-registro", primerRegistro);

module.exports = router;