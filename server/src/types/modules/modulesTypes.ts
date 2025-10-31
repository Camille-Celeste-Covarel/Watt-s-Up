export interface MulterFiles {
  avatar?: Express.Multer.File[];
  vehicle_photo?: Express.Multer.File[];
}

export type VehiculeWithPlug = {
  [key: string]: unknown;
  photo_url?: string;
  plug?: { name: string };
};

export type UserWithVehicles = {
  [key: string]: unknown;
  avatar_url?: string;
  vehicles?: VehiculeWithPlug[];
};
