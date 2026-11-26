// src/routes/productos.routes.js
import { Router } from "express";
import { db } from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import {
  nombreValido,
  precioValido,
  stockValido,
  formatear,
  errorBD,
} from "../validaciones.js";

const router = Router();

// 1. GET /productos -> 200 (público)
router.get("/", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas.map(formatear));
  } catch (error) {
    errorBD(res, error);
  }
});

// 2. GET /productos/:id -> 200 | 404 (público)
router.get("/:id", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json(formatear(filas[0]));
  } catch (error) {
    errorBD(res, error);
  }
});

// 3. POST /productos -> 201 | 400 | 401 (requiere token)
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body ?? {};
    if (!nombreValido(nombre) || !precioValido(precio) || !stockValido(stock)) {
      return res.status(400).json({ error: "Faltan datos o no son válidos (nombre, precio, stock)" });
    }
    const [resultado] = await db.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
      [nombre.trim(), precio, stock]
    );
    res.status(201).json({ id: resultado.insertId, nombre: nombre.trim(), precio, stock });
  } catch (error) {
    errorBD(res, error);
  }
});

// 4. PUT /productos/:id -> 200 | 400 | 401 | 404 (requiere token)
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const { nombre, precio, stock } = req.body ?? {};
    if (!nombreValido(nombre) || !precioValido(precio) || !stockValido(stock)) {
      return res.status(400).json({ error: "PUT requiere nombre, precio y stock válidos" });
    }
    await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nombre.trim(), precio, stock, req.params.id]
    );
    res.status(200).json({ id: filas[0].id, nombre: nombre.trim(), precio, stock });
  } catch (error) {
    errorBD(res, error);
  }
});

// 5. PATCH /productos/:id -> 200 | 400 | 401 | 404 (requiere token)
router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const { nombre, precio, stock } = req.body ?? {};
    if (nombre === undefined && precio === undefined && stock === undefined) {
      return res.status(400).json({ error: "Envía al menos un campo" });
    }
    if (nombre !== undefined && !nombreValido(nombre)) {
      return res.status(400).json({ error: "Nombre inválido" });
    }
    if (precio !== undefined && !precioValido(precio)) {
      return res.status(400).json({ error: "Precio inválido" });
    }
    if (stock !== undefined && !stockValido(stock)) {
      return res.status(400).json({ error: "Stock inválido" });
    }

    // Solo actualizamos los campos que llegaron
    const actual = filas[0];
    const nuevo = {
      nombre: nombre !== undefined ? nombre.trim() : actual.nombre,
      precio: precio !== undefined ? precio : actual.precio,
      stock: stock !== undefined ? stock : actual.stock,
    };
    await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
      [nuevo.nombre, nuevo.precio, nuevo.stock, req.params.id]
    );
    res.status(200).json(formatear({ id: actual.id, ...nuevo }));
  } catch (error) {
    errorBD(res, error);
  }
});

// 6. DELETE /productos/:id -> 204 | 401 | 404 (requiere token y rol admin)
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(204).send(); // sin body
  } catch (error) {
    errorBD(res, error);
  }
});

export default router;