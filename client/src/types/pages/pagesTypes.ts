import type {
  PlugAttributes,
  StationAttributes,
  TerminalAttributes,
  UserAttributes,
  VehiculeAttributes,
} from "../models/models";

export interface PopulatedTerminal extends TerminalAttributes {
  station: StationAttributes;
  plugs: PlugAttributes[];
}

export interface Reservation {
  id: string;
  status: "ACTIVE" | "IN_USE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expires_at: string;
  charge_started_at: string | null;
  session_ends_at: string | null;
  createdAt: string;
  terminal: PopulatedTerminal;
}

export interface SelectedTerminalGroup {
  power: number;
  plugs: Pick<PlugAttributes, "id" | "name">[];
}

export type ReservationSuccessStation = Pick<
  StationAttributes,
  "id" | "nom_station" | "adresse_station"
>;

export type ReservationCreationResponse = Pick<
  Reservation,
  "id" | "status" | "expires_at" | "createdAt"
>;

export interface ReservationSuccessPageLocationState {
  reservation: ReservationCreationResponse;
  station: ReservationSuccessStation;
  selectedGroup: SelectedTerminalGroup;
}

export interface PopulatedVehicule extends VehiculeAttributes {
  plug?: Pick<PlugAttributes, "name">;
}

export interface ProfilePageUser
  extends Omit<
    UserAttributes,
    "password" | "is_admin" | "reset_token" | "reset_token_expiry" | "birthdate"
  > {
  birthdate: string;
  vehicles?: PopulatedVehicule[];
}

export interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  birthdate: string;
  address: string;
  address_bis: string;
  city: string;
  postcode: string;
  country: string;
  vehicle_name: string;
  license_plate: string;
  color: string;
  id_plug: string;
  vehicle_photo_url: string;
}

export interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  birthdate?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  vehicle_name?: string;
  license_plate?: string;
  color?: string;
  id_plug?: string;
}
