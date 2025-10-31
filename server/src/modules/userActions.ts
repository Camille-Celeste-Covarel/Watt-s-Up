import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { RequestHandler } from "express";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import { Plug, User, Vehicule } from "../models/_index";
import type {
  MulterFiles,
  UserWithVehicles,
  VehiculeWithPlug,
} from "../types/modules/modulesTypes";

import type { AuthenticatedRequest } from "../types/auth/auth_type";

// L'opération BREAD : Browse (Read All)
// Récupère tous les utilisateurs de la base de données.
const browse: RequestHandler = async (_req, res, _next) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password", "reset_token", "reset_token_expiry"],
      },
    });
    res.json(users);
  } catch (err) {
    _next(err);
  }
};

// L'opération BREAD : Read (Read One)
// Récupère un utilisateur spécifique par son ID.
const read: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "reset_token", "reset_token_expiry"],
      },
    });
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
const add: RequestHandler = async (_req, res, _next) => {
  res.status(501).json({ message: "Fonction non implémentée." });
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { password, is_admin, ...updateData } = req.body;
    const [affectedCount] = await User.update(updateData, {
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

    const avatarUrl = user.avatar_url
      ? `/uploads/avatars/${user.avatar_url}`
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

const logout: RequestHandler = async (_req, res, _next) => {
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
    _next(err);
  }
};

const check: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
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

    const avatarUrl = userFromDb.avatar_url
      ? `/uploads/avatars/${userFromDb.avatar_url}`
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `<p>Pour réinitialiser votre mot de passe, cliquez sur ce lien : <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">${process.env.CLIENT_URL}/reset-password?token=${token}</a></p>`,
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
    const requestBody = req.body as { token: string; password: string };
    const { token, password } = requestBody;

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

const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
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
      userJson.avatar_url = `/uploads/avatars/${userJson.avatar_url}`;
    }
    if (userJson.vehicles) {
      userJson.vehicles = userJson.vehicles.map((v: VehiculeWithPlug) => ({
        ...v,
        photo_url:
          v.photo_url && !v.photo_url.startsWith("/uploads/vehicules/")
            ? `/uploads/vehicules/${v.photo_url}`
            : v.photo_url,
      }));
    }

    res.json(userJson);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findByPk(req.user?.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    Object.assign(user, req.body);
    await user.save();

    res.json({ message: "Profil mis à jour !" });
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findByPk(req.user?.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (req.file) {
      user.avatar_url = req.file.filename;
      await user.save();
    }
    res.json({ message: "Avatar mis à jour !" });
  } catch (err) {
    next(err);
  }
};

const contact = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { subject, message } = req.body;
    const user = await User.findByPk(req.user?.id, {
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
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const userVehicles = (user as unknown as UserWithVehicles).vehicles
      ?.map(
        (v: VehiculeWithPlug) =>
          `<li style="margin-bottom: 5px;"><strong>${v.name}</strong> (Immatriculation: ${v.license_plate}, Prise: ${v.plug?.name || "N/A"})</li>`,
      )
      .join("") || "<li>Aucun véhicule enregistré.</li>";

    const quinteColor = "#40352c";
    const fondamentalColor = "rgb(242, 198, 65)";
    const textColor = "#333333";
    const lightBgColor = "#f2f2f2";
    const borderColor = "#e0e0e0";

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Watts-Up</title>
          <style>
              body {
                  font-family: "Montserrat", sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: ${lightBgColor};
                  color: ${textColor};
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background-color: ${fondamentalColor};
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
              }
              .content {
                  padding: 20px 30px;
              }
              h2 {
                  color: ${fondamentalColor};
                  font-size: 20px;
                  margin-top: 20px;
                  margin-bottom: 10px;
                  border-bottom: 2px solid ${fondamentalColor};
                  padding-bottom: 5px;
                  display: inline-block;
              }
              p {
                  margin-bottom: 10px;
                  line-height: 1.6;
              }
              strong {
                  color: ${quinteColor};
              }
              ul {
                  list-style: none;
                  padding: 0;
                  margin: 0;
              }
              li {
                  margin-bottom: 5px;
              }
              .summary-section {
                  border-top-width: 1px; border-top-style: solid; border-top-color: ${borderColor};
                  border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: ${borderColor};
                  padding: 20px 0;
                  margin: 20px 0;
              }
              .footer {
                  background-color: ${lightBgColor};
                  color: ${textColor};
                  text-align: center;
                  padding: 15px;
                  font-size: 12px;
              }
              hr {
                  border: none;
                  border-top-width: 1px; border-top-style: solid; border-top-color: ${borderColor};
                  margin: 20px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>
                      <span style="color: #ffffff;">Watts-Up</span>
                  </h1>
              </div>
              <div class="content">
                  <p style="font-size: 1.1rem; color: ${textColor}; margin-bottom: 25px;">
                      Un client a besoin de votre aide.
                  </p>

                  <div class="summary-section">
                      <h2 style="color: ${fondamentalColor}; font-size: 18px; margin-top: 0; margin-bottom: 10px; border-bottom-width: 2px; border-bottom-style: solid; border-bottom-color: ${fondamentalColor}; padding-bottom: 5px; display: inline-block;">Informations de l'utilisateur</h2>
                      <p><strong>Nom:</strong> ${(user as unknown as UserWithVehicles).first_name} ${(user as unknown as UserWithVehicles).last_name}</p>
                      <p><strong>Email:</strong> ${(user as unknown as UserWithVehicles).email}</p>
                      <p><strong>Véhicule(s):</strong></p>
                      <ul style="list-style: none; padding: 0; margin: 0;">
                          ${userVehicles}
                      </ul>
                  </div>

                  <p style="font-size: 1.1rem; color: ${quinteColor}; font-weight: bold; margin-top: 25px;">Sujet de la demande: ${subject}</p>
                  <p style="font-size: 0.9rem; color: ${textColor};">Date d'envoi: ${new Date().toLocaleString("fr-FR")}</p>
                  
                  <hr style="border: none; border-top-width: 1px; border-top-style: solid; border-top-color: ${borderColor}; margin: 20px 0;">

                  <h2 style="color: ${fondamentalColor}; font-size: 18px; margin-top: 0; margin-bottom: 10px; border-bottom-width: 2px; border-bottom-style: solid; border-bottom-color: ${fondamentalColor}; padding-bottom: 5px; display: inline-block;">Message du client</h2>
                  <p style="margin-bottom: 0;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Wattsup. Tous droits réservés.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${(user as unknown as UserWithVehicles).first_name} ${(user as unknown as UserWithVehicles).last_name}" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER,
      subject,
      html: emailHtml,
      replyTo: (user as unknown as UserWithVehicles).email,
    });

    res.json({
      message: "Votre message a bien été envoyé !",
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
  forgotPassword,
  resetPassword,
  check,
  getMe,
  updateMe,
  updateAvatar,
  contact,
};
