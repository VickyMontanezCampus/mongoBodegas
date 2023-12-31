import express from "express";
import { ObjectId} from "mongodb";
import {conx} from "../db_mg/atlas.js";
import {apptraslado} from "../queries/historiales.js"
import { limitQuery } from "../limit/config.js";
import {appMiddlewareData, appDTOData, appValidateData} from "../middleware/historiales.js";

const appHis = express();
appHis.use(express.json());

/* 
6. Carry out an EndPolnt that allows the transfer of a product from one warehouse to another
 
• It must be validated that the number of units to be removed
of a Warehouse, it is possible, since if I have 10 units in the
Warehouse A, I will not be able to get 20 units out of it. This action should
generate an alert and prevent registration.
• For the affectation of the tables it must be considered that from the Origin I must
subtract the amount, and I must add the amount to the destination.
For example: Warehouse A = 10 units. Warehouse B = 10 units. I will do
the transfer of 5
units from Warehouse A to Warehouse B, therefore the result
It will be to update the two records in inventories:
Warehouse A = 5 units. Warehouse B = 15 units. Also make a
lnsert with all the information in the history table. */

/* {
  "id":31,
  "id_producto":1,
  "cantidad":3,
  "id_inventario":2,
  "id_bodega_origen":1,
  "id_bodega_destino":2,
  "created_by":1,
  "updated_by":1,
  "created_at": "2023-08-22",
  "updated_at": "2023-08-22"
} */

appHis.post("/traslado", limitQuery(), appValidateData, appDTOData, appMiddlewareData, apptraslado)

//Get ALL the Documents in the Collection
appHis.get("/", limitQuery(), appMiddlewareData, async (req, res) => {
    let db = await conx();
    let colleccion = db.collection("historiales");
    let result = await colleccion.find({}).toArray();
    if (!result || result.length === 0) {
        res.status(404).json({
            status: 404,
            message: "Not Found"
        });
    } else {
        res.send(result);
    }
});

//Get Document by Id
appHis.get("/:id", limitQuery(), appMiddlewareData,async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        let db = await conx();
        let colleccion = db.collection("historiales");
        let result = await colleccion.find({
            id: id
        }).toArray();

        if (!result || result.length === 0) {
            res.status(404).json({
                status: 404,
                message: "Not Found"
            });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Post a Document into a Collection
appHis.post("/insertOne", limitQuery(), appValidateData, appDTOData, appMiddlewareData, async (req, res) => {
    try {
        const requiredFields = ['id', 'cantidad', 'id_bodega_origen', 'id_bodega_destino', 'id_inventario', 'created_by', 'updated_by']

        if (requiredFields.some(field => !req.body[field])) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request",
                error: 'Missing required fields'
            });
        }
        const db = await conx();
        const collection = db.collection('historiales');
        await collection.insertOne({
            _id: new ObjectId(),
            ...req.body,
            created_at: new Date(req.body.created_at),
            updated_at: new Date(req.body.updated_at)
        });
        res.status(201).json({
            satus: 201,
            message: "Inserted Data :)"
        });
    } catch (e) {
        res.status(500).json({
            satus: 500,
            message: "Internal Server Error",
            error: e.message
        });
    }
});

//Post Many Documents into a Collection
appHis.post("/insertMany", limitQuery(), appMiddlewareData, appDTOData, async (req, res) => {
    try {
        const requiredFields = ['id', 'cantidad', 'id_bodega_origen', 'id_bodega_destino', 'id_inventario', 'created_by', 'updated_by'];

        if (!Array.isArray(req.body) || req.body.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request",
                error: "Request body should be an array of objects"
            });
        }

        const missingFields = req.body.some(item => requiredFields.some(field => !item[field]));

        if (missingFields) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request",
                error: "Missing required fields"
            });
        }

        const db = await conx();
        const collection = db.collection('historiales');

        const insertDocuments = req.body.map(item => ({
            _id: new ObjectId(),
            ...item,
            created_at: new Date(item.created_at),
            updated_at: new Date(item.updated_at),
        }));

        await collection.insertMany(insertDocuments);

        res.status(201).json({
            status: 201,
            message: "Inserted Data :)"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

//Update One Document by id
appHis.put("/updateOne/:id", limitQuery(), appMiddlewareData, appDTOData, async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        const requiredFields = ['id', 'cantidad', 'id_bodega_origen', 'id_bodega_destino', 'id_inventario', 'created_by', 'updated_by'];
        if (requiredFields.some(field => !req.body[field])) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request",
                error: 'Missing required fields'
            });
        }
        const db = await conx();
        const collection = db.collection('historiales');
        const updateDocument = {
            $set: {
                ...req.body,
                created_at: new Date(req.body.created_at),
                updated_at: new Date(req.body.updated_at),
                delete_at: new Date(req.body.delete_at)
            }
        };
        await collection.updateOne({
            id
        }, updateDocument);
        res.status(201).json({
            satus: 201,
            message: "Updated Data :)"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            satus: 500,
            message: `Internal Server Error`,
            error: e.message
        });
    }
});

//Update Many Documents by Id
appHis.put("/updateMany/:id", limitQuery(), appMiddlewareData, appDTOData, async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        const requiredFields = ['id', 'cantidad', 'id_bodega_origen', 'id_bodega_destino', 'id_inventario', 'created_by', 'updated_by'];
        if (requiredFields.some(field => !req.body[field])) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request",
                error: 'Missing required fields'
            });
        }
        const db = await conx();
        const collection = db.collection('historiales');
        const updateDocument = {
            $set: {
                ...req.body,
                created_at: new Date(req.body.created_at),
                updated_at: new Date(req.body.updated_at),
            }
        };
        await collection.updateMany({
            id
        }, updateDocument);
        res.status(201).json({
            satus: 201,
            message: "Updated Data :)"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({
            satus: 500,
            message: `Internal Server Error`,
            error: e.message
        });
    }
});

//Delete One Document By Id
appHis.delete("/deleteOne/:id", limitQuery(), appMiddlewareData, async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        const db = await conx();
        const collection = db.collection('historiales');
        await collection.deleteOne({
            id: id
        });
        res.status(201).json({
            satus: 201,
            message: "Deleted Data :)"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            satus: 500,
            message: `Internal Server Error`,
            error: error.message
        });
    }
});

//Delete Many Documents by Id
appHis.delete("/deleteMany/:id", limitQuery(), appMiddlewareData, async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        const db = await conx();
        const collection = db.collection('historiales');
        await collection.deleteMany({
            id: id
        });
        res.status(201).json({
            satus: 201,
            message: "Deleted Data :)"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            satus: 500,
            message: `Internal Server Error`,
            error: error.message
        });
    }
})

export default appHis;