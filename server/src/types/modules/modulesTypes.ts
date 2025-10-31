export interface MulterFiles {
    avatar?: Express.Multer.File[];
    vehicle_photo?: Express.Multer.File[];
}

export interface VehiculeWithPlug {
    id?: number;
    name: string;
    license_plate: string;
    photo_url?: string;
    id_plug: number;
    id_user: number;
    plug?: {
        name: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}

export interface UserWithVehicles {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    birthdate?: Date;
    address?: string;
    address_bis?: string;
    city?: string;
    postcode?: string;
    country?: string;
    gender?: string;
    avatar_url?: string;
    is_admin: boolean;
    vehicles?: VehiculeWithPlug[];
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}