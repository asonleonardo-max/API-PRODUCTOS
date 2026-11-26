// src/validaciones.js

// Devuelve un objeto con un mensaje por cada campo que tenga error.
// Si el objeto sale vacío, los datos están bien.
// parcial = true se usa en PATCH: solo valida los campos que llegaron.
export function validarProducto(body, { parcial = false } = {}) {
  const errores = {};
  const { nombre, precio, stock } = body ?? {};

  if (!parcial || nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim() === "") {
      errores.nombre = "El nombre es obligatorio";
    }
  }

  if (!parcial || precio !== undefined) {
    if (typeof precio !== "number" || isNaN(precio) || precio < 0) {
      errores.precio = "El precio debe ser un número mayor o igual a 0";
    }
  }

  if (!parcial || stock !== undefined) {
    if (!Number.isInteger(stock) || stock < 0) {
      errores.stock = "El stock debe ser un número entero mayor o igual a 0";
    }
  }

  return errores;
}

export const hayErrores = (errores) => Object.keys(errores).length > 0;

// MySQL devuelve DECIMAL como texto ("80000.00"), lo convertimos a número
export const formatear = (f) => ({ ...f, precio: Number(f.precio) });

// Respuesta estándar cuando falla la base de datos
export const errorBD = (res, error) => {
  console.error(error.message);
  res.status(500).json({ error: "Error en la base de datos" });
};

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarRegistro(body) {
  const errores = {};
  const { email, password } = body ?? {};

  if (typeof email !== "string" || email.trim() === "") {
    errores.email = "El email es obligatorio";
  } else if (!emailValido.test(email.trim())) {
    errores.email = "El email no tiene un formato válido";
  }

  if (typeof password !== "string" || password === "") {
    errores.password = "La contraseña es obligatoria";
  } else if (password.length < 4) {
    errores.password = "La contraseña debe tener al menos 4 caracteres";
  }

  return errores;
}

export function validarLogin(body) {
  const errores = {};
  const { email, password } = body ?? {};

  if (typeof email !== "string" || email.trim() === "") {
    errores.email = "El email es obligatorio";
  }
  if (typeof password !== "string" || password === "") {
    errores.password = "La contraseña es obligatoria";
  }

  return errores;
}