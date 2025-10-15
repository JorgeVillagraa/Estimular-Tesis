const { supabaseAdmin } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Función para validar DNI
function isValidDni(dni) {
  return /^\d{7,15}$/.test(dni);
}

// Función para validar contraseña
function isSafePassword(pwd) {
  // Bloquea patrones comunes de inyección SQL y comandos peligrosos
  const forbidden = [
    /('|--|;|\/\*|\*\/|xp_|exec|union|select|insert|delete|update|drop|alter|create|shutdown)/i
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
      return res.status(400).json({ error: "DNI inválido. Debe tener entre 7 y 15 números." });
    }
    if (!isSafePassword(contrasena)) {
      return res.status(400).json({ error: "Contraseña insegura o inválida." });
    }

    // encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 12);

    // Verificar si el usuario ya existe con Supabase
    const { data: existingUser, error: findErr } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, dni')
      .eq('dni', dni)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error('Error checking existing user:', findErr);
      throw new Error('Error al verificar el usuario existente');
    }

    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Insertar el nuevo usuario con Supabase — usamos password_hash de acuerdo al esquema
    const payload = { dni: Number(dni), password_hash: hash };
    const { data: insertData, error: insertErr } = await supabaseAdmin
      .from('usuarios')
      .insert([payload])
      .select('id_usuario, dni')
      .maybeSingle();

    if (insertErr) {
      console.error('Error inserting user:', insertErr);
      throw new Error('Error al registrar el usuario: ' + insertErr.message);
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', user: insertData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login: valida credenciales y devuelve JWT
const loginUsuario = async (req, res) => {
  try {
    const { dni, contrasena } = req.body || {};
    if (!dni || !contrasena) return res.status(400).json({ error: 'Faltan credenciales' });
    const { data: user, error: findErr } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, dni, password_hash')
      .eq('dni', Number(dni))
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error('Error fetching user for login:', findErr);
      return res.status(500).json({ error: 'Error interno' });
    }
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(contrasena, user.password_hash || '');
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({ id: user.id_usuario, dni: user.dni }, secret, {
      expiresIn: '8h',
    });

    res.json({ success: true, token, user: { id: user.id_usuario, dni: user.dni } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registrarUsuario, loginUsuario };