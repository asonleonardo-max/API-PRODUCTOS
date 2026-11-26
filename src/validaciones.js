// src/validaciones.js
export const nombreValido = (n) => typeof n === "string" && n.trim() !== "";
export const precioValido = (p) => typeof p === "number" && !isNaN(p) && p >= 0;
export const stockValido = (s) => Number.isInteger(s) && s >= 0;

// MySQL devuelve DECIMAL como texto ("80000.00"), lo convertimos a número
export const formatear = (f) => ({ ...f, precio: Number(f.precio) });

// Respuesta estándar cuando falla la base de datos
export const errorBD = (res, error) => {
  console.error(error.message);
  res.status(500).json({ error: "Error en la base de datos" });
};