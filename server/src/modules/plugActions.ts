import { Plug } from "../models/plug.model";
import type { RequestHandler } from "express";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const allowedNames = ["Combo CCS", "Type 2", "Chademo", "Type EF"];
    const plugs = await Plug.findAll({
      attributes: ["id", "name"],
      where: { name: allowedNames },
    });
    res.json(plugs);
  } catch (err) {
    next(err);
  }
};

export default { browse };
