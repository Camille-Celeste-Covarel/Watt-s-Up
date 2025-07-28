import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import type { AuthRequest } from "../middleware/isConnected";
import { Plug, User, Vehicule } from "../models/_index";

interface MulterFiles {
  avatar?: Express.Multer.File[];
  vehicle_photo?: Express.Multer.File[];
}

type VehiculeWithPlug = {
  [key: string]: unknown;
  photo_url?: string;
  plug?: { name: string };
};

type UserWithVehicles = {
  [key: string]: unknown;
  avatar_url?: string;
  vehicles?: VehiculeWithPlug[];
};

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
    const userId = req.params.id;
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
  res.status(501).json({ message: "Fonction non implémentée." });
};

// L'opération BREAD : Edit (Update)
const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
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
    const userId = req.params.id;
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
      birthdate,
      address,
      address_bis,
      city,
      postcode,
      country,
      gender,
      vehicle_name,
      license_plate,
      id_plug,
    } = req.body;

    const files = req.files as MulterFiles;
    const avatarFile = files?.avatar?.[0];
    const vehiclePhotoFile = files?.vehicle_photo?.[0];

    const avatar_url = avatarFile ? avatarFile.filename : undefined;
    const vehicle_photo_url = vehiclePhotoFile
      ? vehiclePhotoFile.filename
      : undefined;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ error: "Un utilisateur avec cet email existe déjà" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

    if (vehicle_name && license_plate && id_plug) {
      await Vehicule.create({
        name: vehicle_name,
        license_plate,
        id_plug,
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

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const avatarUrl = user.avatar_url
      ? `${baseUrl}/api/uploads/avatars/${user.avatar_url}`
      : null;

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin,
      avatarUrl: avatarUrl,
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

const check: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non authentifié." });
      return;
    }

    const userFromDb = await User.findByPk(req.user.id, {
      attributes: ["id", "first_name", "is_admin", "avatar_url"],
    });

    if (!userFromDb) {
      res.status(404).json({ error: "Utilisateur non trouvé en BDD." });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const avatarUrl = userFromDb.avatar_url
      ? `${baseUrl}/api/uploads/avatars/${userFromDb.avatar_url}`
      : null;

    res.json({
      authenticated: true,
      user: {
        firstName: userFromDb.first_name,
        isAdmin: userFromDb.is_admin,
        avatarUrl: avatarUrl,
      },
    });
  } catch (error) {
    next(error);
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

    const userJson = user.toJSON() as unknown as UserWithVehicles;

    if (userJson.avatar_url) {
      userJson.avatar_url = `/api/uploads/avatars/${userJson.avatar_url}`;
    }
    if (userJson.vehicles) {
      userJson.vehicles = userJson.vehicles.map((v) => ({
        ...v,
        photo_url: v.photo_url
          ? `/api/uploads/vehicules/${v.photo_url}`
          : undefined,
      }));
    }

    res.json(userJson);
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
  check,
  getMe,
};
