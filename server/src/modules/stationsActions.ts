import type { RequestHandler } from "express";
import { Station } from "../models/station.model";

// L'opération BREAD : Browse (Read All)
// Récupère toutes les ressources.
const browse: RequestHandler = async (req, res, next) => {
  try {
    const stations = await Station.findAll();
    res.json(stations);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Read (Read One)
// Récupère une ressource spécifique par son ID.
const read: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await Station.findByPk(id);

    if (!station) {
      res.sendStatus(404);
      return;
    }

    res.json(station);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
// Ajoute une nouvelle ressource.
const add: RequestHandler = async (req, res, next) => {
  try {
    const newStation = await Station.create(req.body);
    res.status(201).json(newStation);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Edit (Update)
// Met à jour une ressource existante par son ID.
const edit: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await Station.update(req.body, {
      where: { id },
    });
    if (updatedRowsCount === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Destroy (Delete)
// Supprime une ressource par son ID.
const destroy: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Station.destroy({ where: { id } });

    if (deletedRowsCount === 0) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { browse, read, add, edit, destroy };
