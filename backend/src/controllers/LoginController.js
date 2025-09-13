const db = require("../config/db.js");
const bcrypt = require("bcrypt");

// Registrar un usuario
const registrarUsuario = async (req, res) => {
  try {
    const { dni, contrasena } = req.body;

    // encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    await db.query(
      "INSERT INTO usuarios (dni, contrasena) VALUES (?, ?)",
      [dni, hash]
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Iniciar sesión
const loginUsuario = async (req, res) => {
  try {
    const { dni, contrasena } = req.body;

    const [rows] = await db.query("SELECT * FROM usuarios WHERE dni = ?", [dni]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registrarUsuario, loginUsuario };

