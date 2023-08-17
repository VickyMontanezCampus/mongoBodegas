import express from "express";
import { limitQuery } from "../limit/config.js";
import { getProductos } from "../queries/productos.js";
import { appValidateData, appMiddlewareBodega, appDTOData } from "../middleware/productos.js";

const apProductos = express();
apProductos.use(express.json());

apProductos.get("/all", limitQuery(), appMiddlewareBodega, getProductos);

export default apProductos;