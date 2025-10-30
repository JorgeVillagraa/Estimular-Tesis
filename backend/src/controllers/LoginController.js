const supabase = require("../config/db.js");
const bcrypt = require("bcrypt");

// Función para validar DNI
function isValidDni(dni) {
  return /^\d{7,15}$/.test(dni);
}

// Función para validar contraseña
function isSafePassword(pwd) {
  // Bloquea patrones comunes de inyección SQL y comandos peligrosos
  const forbidden = [
    /('|--|;|\/\*|\*\/|xp_|exec|union|select|insert|delete|update|drop|alter|create|shutdown)/i,
  ];
  return (
    typeof pwd === "string" &&
    pwd.length >= 8 &&
    !forbidden.some((regex) => regex.test(pwd))
  );
}

// Registrar un usuario
const registrarUsuario = async (req, res) => {
  try {
    const { dni, contrasena } = req.body;

    // Validaciones
    if (!isValidDni(dni)) {
      return res
        .status(400)
        .json({ error: "DNI inválido. Debe tener entre 7 y 15 números." });
    }
    if (!isSafePassword(contrasena)) {
      return res.status(400).json({ error: "Contraseña insegura o inválida." });
    }

    // encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    const { error } = await supabase
      .from("usuarios")
      .insert({ rol_id: 3, username: dni, password_hash: hash });

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return res.status(409).json({ error: "El usuario ya existe." });
      }
      throw error;
    }

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Iniciar sesión
const loginUsuario = async (req, res) => {
  try {
    const { dni, contrasena } = req.body;

    // Validaciones
    if (!isValidDni(dni)) {
      return res.status(400).json({ error: "DNI inválido." });
    }
    if (!isSafePassword(contrasena)) {
      return res.status(400).json({ error: "Contraseña insegura o inválida." });
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("username", dni)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.password_hash);

    if (!coincide) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Nunca devuelvas la contraseña (ni siquiera hasheada)
    delete usuario.password_hash;

    res.json({ message: "Login exitoso", usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registrarUsuario, loginUsuario };
