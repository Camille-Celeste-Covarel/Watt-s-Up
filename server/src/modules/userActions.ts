import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import type { AuthRequest } from "../middleware/isConnected";
import { User, Vehicule, Plug } from "../models/_index";

// Ajoute ceci :
interface MulterFiles {
  avatar?: Express.Multer.File[];
  vehicle_photo?: Express.Multer.File[];
}

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
    const userId = req.params.id; // <-- UUID string
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
  // ...à compléter si besoin
};

// L'opération BREAD : Edit (Update)
const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id; // <-- UUID string
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
    const userId = req.params.id; // <-- UUID string
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
    // Les champs texte sont dans req.body, le fichier dans req.file
    const {
      email,
      password,
      first_name,
      last_name,
      birthdate,
      address,
      address_bis,
      city,
      postcode,
      country,
      gender,
    } = req.body;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        error: "Un utilisateur avec cet email existe déjà",
      });
      return;
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Si un fichier a été uploadé, construit l'URL d'accès
    let avatar_url: string | undefined = undefined;
    let vehicle_photo_url: string | undefined = undefined;

    // Multer fields mode : req.files est un objet { avatar: [file], vehicle_photo: [file] }
    const files = req.files as MulterFiles;

    if (files.avatar?.[0]) {
      avatar_url = `/uploads/avatars/${files.avatar[0].filename}`;
    }
    if (files.vehicle_photo?.[0]) {
      vehicle_photo_url = `/uploads/vehicle_photos/${files.vehicle_photo[0].filename}`;
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      birthdate,
      address,
      address_bis,
      city,
      postcode,
      country,
      gender,
      avatar_url,
      is_admin: false,
    });

    // Création du véhicule si les infos sont présentes
    if (req.body.vehicle_name && req.body.license_plate && req.body.id_plug) {
      await Vehicule.create({
        name: req.body.vehicle_name,
        license_plate: req.body.license_plate,
        id_plug: req.body.id_plug,
        id_user: user.id,
        photo_url: vehicle_photo_url,
      });
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
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
        id: user.id,
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

const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.json({
        message: "Si l'email existe, un lien a été envoyé.",
      });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

    user.reset_token = token;
    user.reset_token_expiry = tokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien : <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({
      message: "Si l'email existe, un lien a été envoyé.",
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Vérification de la longueur du mot de passe
    if (!password || password.length < 6) {
      res
        .status(400)
        .json({ message: "Le mot de passe doit faire au moins 6 caractères." });
      return;
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ message: "Lien invalide ou expiré." });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    res.json({ message: "Votre mot de passe a bien été réinitialisé." });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log("ID utilisateur reçu dans getMe :", req.user?.id);
    const user = await User.findByPk(req.user?.id, {
      attributes: {
        exclude: ["password", "reset_token", "reset_token_expiry"],
      },
      include: [
        {
          model: Vehicule,
          as: "vehicles",
          include: [
            {
              model: Plug,
              as: "plug",
              attributes: ["name"],
            },
          ],
        },
      ],
    });
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }
    res.json(user);
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
  forgotPassword,
  resetPassword,
  getMe,
};
