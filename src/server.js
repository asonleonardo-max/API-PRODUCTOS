// src/server.js
import express from "express";
import authRouter from "./routes/auth.routes.js";
import productosRouter from "./routes/productos.routes.js";

const app = express();
app.use(express.json());

app.use(authRouter);
app.use("/productos", productosRouter);

app.listen(3000, () => console.log("Servidor listo en http://localhost:3000"));