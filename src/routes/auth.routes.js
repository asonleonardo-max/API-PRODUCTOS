// src/routes/auth.routes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { validarRegistro, validarLogin, hayErrores } from "../validaciones.js";

const router = Router();

// POST /registro -> 201 | 400
router.post("/registro", async (req, res) => {
  try {
    const errores = validarRegistro(req.body);
    if (hayErrores(errores)) return res.status(400).json({ errores });

    const { email, password, rol } = req.body;
    const rolFinal = rol === "admin" ? "admin" : "usuario";
    const hash = await bcrypt.hash(password, 10);
    const [resultado] = await db.query(
      "INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)",
      [email.trim(), hash, rolFinal]
    );
    res.status(201).json({ id: resultado.insertId, email: email.trim(), rol: rolFinal });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ errores: { email: "El email ya está registrado" } });
    }
    console.error(error.message);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

// POST /login -> 200 { token } | 400 | 401
router.post("/login", async (req, res) => {
  try {
    const errores = validarLogin(req.body);
    if (hayErrores(errores)) return res.status(400).json({ errores });

    const { email, password } = req.body;
    const [filas] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email.trim()]);
    const usuario = filas[0];
    if (!usuario) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

export default router;