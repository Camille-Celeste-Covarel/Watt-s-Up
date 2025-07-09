import express from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import bookActions from "./modules/bookActions";
import requestActions from "./modules/requestActions";
import stationsActions from "./modules/stationsActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";

const router = express.Router();

/* ************************************************************************* */
// Routes d'API
// Le préfixe "/api" est déjà géré dans app.ts, on ne le met pas ici.
/* ************************************************************************* */

router.post("/import/csv", upload.single("csvFile"), importCsv);

router.get("/users", userActions.browse);
router.get("/users/:id", userActions.read);
router.post("/users", userActions.add);
router.put("/users/:id", userActions.edit);
router.delete("/users/:id", userActions.destroy);

router.get("/books", bookActions.browse);
router.get("/books/:id", bookActions.read);
router.post("/books", bookActions.add);
router.put("/books/:id", bookActions.edit);
router.delete("/books/:id", bookActions.destroy);

router.get("/requests", requestActions.browse);
router.get("/requests/:id", requestActions.read);
router.post("/requests", requestActions.add);
router.put("/requests/:id", requestActions.edit);
router.delete("/requests/:id", requestActions.destroy);

router.get("/vehicules", vehiculeActions.browse);
router.get("/vehicules/:id", vehiculeActions.read);
router.post("/vehicules", vehiculeActions.add);
router.put("/vehicules/:id", vehiculeActions.edit);
router.delete("/vehicules/:id", vehiculeActions.destroy);

router.get("/stations", stationsActions.browse);
router.get("/stations/visible", stationsActions.browseVisible);
router.get("/stations/:id", stationsActions.read);
router.post("/stations", stationsActions.add);
router.put("/stations/:id", stationsActions.edit);
router.delete("/stations/:id", stationsActions.destroy);

/* ************************************************************************* */

export default router;
