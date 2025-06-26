import type { RequestHandler } from "express";
import { User } from "../models/_index";

// L'opération BREAD : Browse (Read All)
// Récupère tous les utilisateurs de la base de données.
const browse: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Read (Read One)
// Récupère un utilisateur spécifique par son ID.
const read: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const user = await User.findByPk(userId);

    if (user == null) {
      res.sendStatus(404);
    } else {
      res.json(user);
    }
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Add (Create)
// Ajoute un nouvel utilisateur à la base de données.
const add: RequestHandler = async (req, res, next) => {
  try {
    const [user, created] = await User.findOrCreate({
      defaults: {
        first_name: "Test",
        last_name: "User",
        email: "test.user@example.com",
        password: "securepassword123",
        birthdate: new Date("1990-01-01"),
        address: "123 Main St",
        city: "Anytown",
        postcode: "12345",
        country: "FR",
        is_admin: false,
      },
    });

    if (created) {
      res
        .status(201)
        .json({ id: user.id, message: "Utilisateur créé avec succès" });
    } else {
      res
        .status(200)
        .json({ id: user.id, message: "Utilisateur déjà existant" });
    }
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const [affectedCount] = await User.update(req.body, {
      where: { id: userId },
    });

    if (affectedCount === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

// L'opération BREAD : Destroy (Delete)
// Supprime un utilisateur par son ID.
const destroy: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const deletedCount = await User.destroy({
      where: { id: userId },
    });

    if (deletedCount === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

export default { browse, read, add, edit, destroy };
