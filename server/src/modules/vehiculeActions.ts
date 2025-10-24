import type { NextFunction, RequestHandler, Response } from "express";
import { Vehicule } from "../models/_index";
import type { AuthenticatedRequest } from "../types/auth/auth_type";

// L'opération BREAD : Browse (Read All)
// Récupère toutes les ressources (par exemple, toutes les réservations).
const browse: RequestHandler = async (req, res, next) => {
  try {
    res.json([]);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Read (Read One)
// Récupère une ressource spécifique par son ID.
const read: RequestHandler = async (req, res, next) => {
  try {
    res.sendStatus(404);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
// Ajoute une nouvelle ressource.
const add: RequestHandler = async (req, res, next) => {
  try {
    res.status(201).json({});
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Edit (Update)
// Met à jour une ressource existante par son ID.
const edit: RequestHandler = async (req, res, next) => {
  try {
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Destroy (Delete)
// Supprime une ressource par son ID.
const destroy: RequestHandler = async (req, res, next) => {
  try {
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// Met à jour un véhicule existant par son ID.
const updateVehicule = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule || vehicule.id_user !== req.user?.id)
      return res
        .status(404)
        .json({ error: "Véhicule non trouvé ou accès refusé" });

    Object.assign(vehicule, req.body);
    await vehicule.save();

    res.json({ message: "Véhicule mis à jour !" });
  } catch (err) {
    next(err);
  }
};

// Met à jour la photo d'un véhicule existant par son ID.
const updateVehiculePhoto: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicule = await Vehicule.findByPk(req.params.id);
    if (!vehicule || vehicule.id_user !== req.user?.id)
      return res
        .status(404)
        .json({ error: "Véhicule non trouvé ou accès refusé" });

    if (req.file) {
      vehicule.photo_url = req.file.filename;
      await vehicule.save();
    }
    res.json({ message: "Photo du véhicule mise à jour !" });
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  read,
  add,
  edit,
  destroy,
  updateVehicule,
  updateVehiculePhoto,
};
