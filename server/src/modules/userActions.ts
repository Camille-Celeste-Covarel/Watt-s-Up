import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
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

const register: RequestHandler = async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      address,
      city,
      postcode,
      country,
    } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        error: "Un utilisateur avec cet email existe déjà",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      birthdate: new Date(),
      address: address,
      city: city,
      postcode: postcode,
      country: country,
      is_admin: false,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: "Email ou mot de passe incorrect",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        error: "Email ou mot de passe incorrect",
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" } as jwt.SignOptions,
    );

    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_admin,
    };

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Connexion réussie",
      user: userResponse,
    });
  } catch (err) {
    next(err);
  }
};

const logout: RequestHandler = async (req, res, next) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      message: "Déconnexion réussie",
    });
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
  register,
  login,
  logout,
};
