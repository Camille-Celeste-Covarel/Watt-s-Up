import { UserAttributes, VehiculeAttributes, PlugAttributes } from "../types/models/models";

export interface MulterFiles {
  avatar?: Express.Multer.File[];
  vehicle_photo?: Express.Multer.File[];
}

// Définition de VehiculeWithPlug pour inclure les détails de la prise
// Il étend VehiculeAttributes et ajoute la propriété 'plug'
export interface VehiculeWithPlug extends VehiculeAttributes {
  plug?: PlugAttributes; // Utiliser PlugAttributes du modèle
}

// UserWithVehicles est un type d'intersection de UserAttributes et d'un objet avec 'vehicles'
export type UserWithVehicles = UserAttributes & {
  vehicles?: VehiculeWithPlug[];
};
