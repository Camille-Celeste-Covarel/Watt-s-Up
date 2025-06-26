import express from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import bookActions from "./modules/bookActions";
import requestActions from "./modules/requestActions";
import stationActions from "./modules/stationActions";
import userActions from "./modules/userActions";
import vehiculeActions from "./modules/vehiculeActions";
const router = express.Router();

/* ************************************************************************* */
// Routes d'API
/* ************************************************************************* */

router.post("/api/import/csv", upload.single("csvFile"), importCsv);

router.get("/api/users", userActions.browse);
router.get("/api/users/:id", userActions.read);
router.post("/api/users", userActions.add);
router.put("/api/users/:id", userActions.edit);
router.delete("/api/users/:id", userActions.destroy);

router.get("/api/books", bookActions.browse);
router.get("/api/books/:id", bookActions.read);
router.post("/api/books", bookActions.add);
router.put("/api/books/:id", bookActions.edit);
router.delete("/api/books/:id", bookActions.destroy);

router.get("/api/requests", requestActions.browse);
router.get("/api/requests/:id", requestActions.read);
router.post("/api/requests", requestActions.add);
router.put("/api/requests/:id", requestActions.edit);
router.delete("/api/requests/:id", requestActions.destroy);

router.get("/api/vehicules", vehiculeActions.browse);
router.get("/api/vehicules/:id", vehiculeActions.read);
router.post("/api/vehicules", vehiculeActions.add);
router.put("/api/vehicules/:id", vehiculeActions.edit);
router.delete("/api/vehicules/:id", vehiculeActions.destroy);

router.get("/api/station", stationActions.browse);
router.get("/api/station/:id", stationActions.read);
router.post("/api/station", stationActions.add);
router.put("/api/station/:id", stationActions.edit);
router.delete("/api/station/:id", stationActions.destroy);

/* ************************************************************************* */

export default router;
