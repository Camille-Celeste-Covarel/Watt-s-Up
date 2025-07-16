import type { RequestHandler } from "express";
import { Book } from "../models/book.model";
import { Terminal } from "../models/terminal.model";
import { User } from "../models/user.model";

// L'opération BREAD : Browse (Read All)
// Récupère toutes les ressources (par exemple, toutes les réservations).
const browse: RequestHandler = async (req, res, next) => {
  try {
    // lister toutes les réservations
    const reservations = await Book.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        { model: Terminal, as: "terminal", attributes: ["id", "num_pdc"] },
      ],
    });
    res.json(reservations);
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

export default { browse, read, add, edit, destroy };
