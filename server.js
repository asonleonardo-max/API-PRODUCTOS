// server.js
import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());

// Validadores
const nombreValido = (n) => typeof n === "string" && n.trim() !== "";
const precioValido = (p) => typeof p === "number" && !isNaN(p) && p >= 0;
const stockValido = (s) => Number.isInteger(s) && s >= 0;

// MySQL devuelve DECIMAL como texto ("80000.00"), lo convertimos a número
const formatear = (f) => ({ ...f, precio: Number(f.precio) });

// Respuesta estándar cuando falla la base de datos
const errorBD = (res, error) => {
  console.error(error.message);
  res.status(500).json({ error: "Error en la base de datos" });
};

// 1. GET /productos -> 200
app.get("/productos", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos");
    res.status(200).json(filas.map(formatear));
  } catch (error) {
    errorBD(res, error);
  }
});

// 2. GET /productos/:id -> 200 | 404
app.get("/productos/:id", async (req, res) => {
  try {
    const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (filas.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(200).json(formatear(filas[0]));
  } catch (error) {
    errorBD(res, error);
  }
});

// 3. POST /productos -> 201 | 400
app.post("/productos", async (req, res) => {
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

// 4. PUT /productos/:id -> 200 | 400 | 404 (reemplaza todos los campos)
app.put("/productos/:id", async (req, res) => {
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

// 5. PATCH /productos/:id -> 200 | 400 | 404 (solo algunos campos)
app.patch("/productos/:id", async (req, res) => {
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

// 6. DELETE /productos/:id -> 204 | 404
app.delete("/productos/:id", async (req, res) => {
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

app.listen(3000, () => console.log("Servidor listo en http://localhost:3000"));