# API de Productos (back-end)

API REST hecha con **Node.js**, **Express** y **MySQL** (`mysql2`). Maneja un CRUD de productos, registro e inicio de sesión de usuarios con contraseñas cifradas (**bcrypt**) y autenticación con **JWT**. Cuando los datos llegan mal, responde con **un mensaje de error por cada campo**.

## Requisitos

- Node.js 20.6 o superior (usa `--env-file`)
- MySQL 8 o superior

## Cómo ejecutarlo

1. **Instalar las dependencias**

   ```bash
   npm install
   ```

2. **Crear la base de datos y las tablas.** Ejecuta el archivo `tienda.sql` en MySQL (por ejemplo desde MySQL Workbench, o con la terminal):

   ```bash
   mysql -u root -p < tienda.sql
   ```

3. **Crear el archivo `.env`.** Copia `.env.example`, renómbralo a `.env` y llena los valores:

   ```dotenv
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_de_mysql
   DB_NAME=tienda
   JWT_SECRET=una_clave_larga_y_secreta
   ```

4. **Arrancar el servidor**

   ```bash
   npm run dev     # con reinicio automático al guardar
   npm start       # normal
   ```

   Debe aparecer: `Servidor listo en http://localhost:3000`

> Si cambias el `.env`, detén el servidor (`Ctrl + C`) y vuelve a arrancarlo.

## Endpoints

### Autenticación

| Método | Ruta        | Descripción                         | Respuestas        |
| ------ | ----------- | ----------------------------------- | ----------------- |
| POST   | `/registro` | Crea un usuario                     | 201, 400          |
| POST   | `/login`    | Inicia sesión y devuelve un `token` | 200, 400, 401     |

### Productos

| Método | Ruta              | Token | Descripción               | Respuestas              |
| ------ | ----------------- | ----- | ------------------------- | ----------------------- |
| GET    | `/productos`      | No    | Lista los productos       | 200                     |
| GET    | `/productos/:id`  | No    | Devuelve un producto      | 200, 404                |
| POST   | `/productos`      | Sí    | Crea un producto          | 201, 400, 401           |
| PUT    | `/productos/:id`  | Sí    | Reemplaza un producto     | 200, 400, 401, 404      |
| PATCH  | `/productos/:id`  | Sí    | Actualiza campos sueltos  | 200, 400, 401, 404      |
| DELETE | `/productos/:id`  | Sí (admin) | Borra un producto    | 204, 401, 403, 404      |

Para las rutas protegidas se envía el token en el encabezado:

```
Authorization: Bearer <token>
```

El token se obtiene con `POST /login` y dura 1 hora. Si falta o no es válido, la API responde **401**. El `DELETE` solo lo puede usar un usuario con rol `admin` (si no, responde 403).

### Campos de un producto

| Campo    | Tipo   | Regla                          |
| -------- | ------ | ------------------------------ |
| `nombre` | texto  | Obligatorio, no puede ser vacío |
| `precio` | número | Obligatorio, mayor o igual a 0 |
| `stock`  | entero | Obligatorio, mayor o igual a 0 |

### Formato de los errores de validación

Cuando hay datos inválidos, la API responde **400** con un mensaje por cada campo con problema:

```json
{
  "errores": {
    "nombre": "El nombre es obligatorio",
    "precio": "El precio debe ser un número mayor o igual a 0"
  }
}
```

Los errores que no pertenecen a un campo (token inválido, producto no encontrado, credenciales incorrectas) usan la forma `{ "error": "mensaje" }`.

## Crear un usuario administrador

Los usuarios se registran con rol `usuario`. Para convertir uno en administrador:

```sql
UPDATE usuarios SET rol = 'admin' WHERE email = 'correo@ejemplo.com';
```

Después hay que iniciar sesión otra vez para obtener un token con el rol nuevo.

## Probar con Postman

En la carpeta `postman/` está la colección `coleccion-api.json`. Para usarla:

1. En Postman, **Import** y selecciona el archivo.
2. Ejecuta `login`: el token se guarda solo en la variable `{{token}}` y los demás requests lo usan.
3. La variable `baseUrl` apunta a `http://localhost:3000`.

## CORS

La API tiene CORS habilitado (paquete `cors`) para que la página del front-end, que corre en otro puerto, pueda hacer peticiones.

## Estructura del proyecto

```
├── package.json
├── .env.example        plantilla de las variables de entorno
├── tienda.sql          crea la base de datos y las tablas
├── postman/
│   └── coleccion-api.json
└── src/
    ├── server.js       monta CORS y los routers
    ├── db.js           conexión a MySQL
    ├── validaciones.js validaciones por campo
    ├── routes/
    │   ├── auth.routes.js
    │   └── productos.routes.js
    └── middlewares/
        └── auth.middleware.js
```
