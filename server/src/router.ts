import express from "express";
import upload from "./config/multer";
import { importCsv } from "./controllers/importController";
import userActions from "./modules/userActions";
// import bookActions from "./modules/bookActions";
// import requestActions from "./modules/requestActions";
// import vehiculeActions from "./modules/vehiculeActions";

const router = express.Router();

/* ************************************************************************* */
// Routes d'API
/* ************************************************************************* */

// Route pour l'importation de fichiers CSV
router.post("/api/import/csv", upload.single("csvFile"), importCsv);

// Routes liées aux utilisateurs (anciennement "items")
router.get("/api/users", userActions.browse);
router.get("/api/users/:id", userActions.read);
router.post("/api/users", userActions.add);
router.put("/api/users/:id", userActions.edit);
router.delete("/api/users/:id", userActions.destroy);

// Exemple de routes pour d'autres entités (décommenter et adapter si besoin)
/*
// Routes liées aux réservations (Book)
router.get("/api/books", bookActions.browse);
router.get("/api/books/:id", bookActions.read);
router.post("/api/books", bookActions.add);
router.put("/api/books/:id", bookActions.edit);
router.delete("/api/books/:id", bookActions.destroy);

// Routes liées aux requêtes (Request)
router.get("/api/requests", requestActions.browse);
router.get("/api/requests/:id", requestActions.read);
router.post("/api/requests", requestActions.add);
router.put("/api/requests/:id", requestActions.edit);
router.delete("/api/requests/:id", requestActions.destroy);

// Routes liées aux véhicules (Vehicule)
router.get("/api/vehicules", vehiculeActions.browse);
router.get("/api/vehicules/:id", vehiculeActions.read);
router.post("/api/vehicules", vehiculeActions.add);
router.put("/api/vehicules/:id", vehiculeActions.edit);
router.delete("/api/vehicules/:id", vehiculeActions.destroy);
*/

/* ************************************************************************* */

export default router;
