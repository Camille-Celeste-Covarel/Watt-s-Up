import type * as GeoJSON from "geojson";
import type { Optional } from "sequelize";
import type { Literal } from "sequelize/types/utils";

export interface AccessAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type AccessCreationAttributes = Optional<
  AccessAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface BookAttributes {
  id: string;
  id_user: string;
  id_terminal: string;
  status: string;
  expires_at: Date;
  charge_started_at: Date | null;
  session_ends_at: Date | null;
  price: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookCreationAttributes = Optional<
  BookAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "price"
  | "id_terminal"
  | "status"
  | "expires_at"
  | "session_ends_at"
  | "charge_started_at"
  | "id_user"
>;

export interface CompagnyAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type CompagnyCreationAttributes = Optional<
  CompagnyAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface ImportLogAttributes {
  id: string;
  import_id: string;
  file_name: string;
  total_lines_processed: number;
  successful_lines: number;
  error_summary: Record<string, unknown> | null;
  error_log_file_path: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED";
  import_date: Date;
  duration_ms?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ImportLogCreationAttributes = Optional<
  ImportLogAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface ObservationAttributes {
  id: string;
  comment: string | null;
  id_station: string;
  id_user: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ObservationCreationAttributes = Optional<
  ObservationAttributes,
  "id" | "createdAt" | "updatedAt" | "comment"
>;

export interface OperatorAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type OperatorCreationAttributes = Optional<
  OperatorAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface PlugAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type PlugCreationAttributes = Optional<
  PlugAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface PowerAttributes {
  id: string;
  name: number;
  readonly charging_type?:
    | "Lente"
    | "Accélérée"
    | "Rapide"
    | "Très Rapide"
    | "Inconnue";
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
export interface PowerCreationAttributes
  extends Omit<
    PowerAttributes,
    "id" | "createdAt" | "updatedAt" | "charging_type"
  > {}

export interface ProviderAttributes {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ProviderCreationAttributes = Optional<
  ProviderAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface RequestAttributes {
  id: string;
  message: string | null;
  date_request: Date | null;
  status: string | null;
  response: string | null;
  id_user: string;
  id_terminal: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type RequestCreationAttributes = Optional<
  RequestAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "message"
  | "date_request"
  | "status"
  | "response"
>;

export interface StationAttributes {
  id: string;
  id_station_itinerance: string | null;
  id_access: string | null;
  id_provider: string | null;
  nom_amenageur: string | null;
  siren_amenageur: string | null;
  contact_amenageur: string | null;
  nom_operateur: string | null;
  id_operator: string | null;
  contact_operateur: string | null;
  telephone_operateur: string | null;
  nom_enseigne: string | null;
  id_compagny: string | null;
  id_station_local: string | null;
  nom_station: string | null;
  implantation_station: string | null;
  adresse_station: string | null;
  code_insee_commune: string | null;
  nbre_pdc?: number | null;
  puissance_max: number | null;
  gratuit: boolean | null;
  paiement_acte: boolean | null;
  paiement_cb: boolean | null;
  paiement_autre: string | null;
  tarification: string | null;
  condition_acces: string | null;
  reservation: boolean | null;
  horaires: string | null;
  accessibilite_pmr: string | null;
  restriction_gabarit: string | null;
  station_deux_roues: boolean | null;
  raccordement: string | null;
  num_pdl: string | null;
  date_mise_en_service: Date | null;
  observations: string | null;
  date_maj: Date | null;
  cable_t2_attache: boolean | null;
  last_modified: Date | null;
  datagouv_dataset_id: string | null;
  datagouv_resource_id: string | null;
  datagouv_organization_or_owner: string | null;
  consolidated_latitude: number | null;
  consolidated_longitude: number | null;
  consolidated_code_postal: string | null;
  consolidated_commune: string | null;
  consolidated_is_lon_lat_correct: boolean | null;
  consolidated_is_code_insee_verified: boolean | null;
  consolidated_is_code_insee_modified: boolean | null;
  coordonnees_x_y: string | null;
  geom?: GeoJSON.Point | Literal | null;
  geojson_geom?: GeoJSON.Point | null;
  latitude?: number;
  longitude?: number;
  terminals?: TerminalAttributes[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type StationCreationAttributes = Optional<
  StationAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "id_station_itinerance"
  | "id_access"
  | "id_provider"
  | "nom_amenageur"
  | "siren_amenageur"
  | "contact_amenageur"
  | "nom_operateur"
  | "id_operator"
  | "contact_operateur"
  | "telephone_operateur"
  | "nom_enseigne"
  | "id_compagny"
  | "id_station_local"
  | "implantation_station"
  | "adresse_station"
  | "code_insee_commune"
  | "nbre_pdc"
  | "gratuit"
  | "paiement_acte"
  | "paiement_cb"
  | "paiement_autre"
  | "tarification"
  | "condition_acces"
  | "reservation"
  | "horaires"
  | "accessibilite_pmr"
  | "restriction_gabarit"
  | "station_deux_roues"
  | "raccordement"
  | "num_pdl"
  | "date_mise_en_service"
  | "observations"
  | "date_maj"
  | "cable_t2_attache"
  | "last_modified"
  | "datagouv_dataset_id"
  | "datagouv_resource_id"
  | "datagouv_organization_or_owner"
  | "consolidated_latitude"
  | "consolidated_longitude"
  | "consolidated_code_postal"
  | "consolidated_commune"
  | "consolidated_is_lon_lat_correct"
  | "consolidated_is_code_insee_verified"
  | "consolidated_is_code_insee_modified"
  | "coordonnees_x_y"
  | "geom"
>;

export interface TerminalAttributes {
  id: string;
  id_station: string;
  id_power: string | null;
  id_pdc_itinerance: string | null;
  id_pdc_local: string | null;
  is_booked: boolean;
  latitude?: number | null;
  longitude?: number | null;
  geom?: GeoJSON.Point | Literal | null;
  puissance_nominale: number;
  status: string | null;
  num_pdc: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
export type TerminalCreationAttributes = Optional<
  TerminalAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "id_power"
  | "id_pdc_itinerance"
  | "id_pdc_local"
  | "latitude"
  | "longitude"
  | "geom"
  | "status"
  | "num_pdc"
>;

export interface TerminalPlugAttributes {
  id: string;
  idPlug: string;
  idTerminal: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TerminalPlugCreationAttributes = Optional<
  TerminalPlugAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface UserAttributes {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: "Femme" | "Homme" | "Autre";
  birthdate: Date;
  address: string;
  address_bis?: string;
  city: string;
  postcode: string;
  country: string;
  password: string;
  avatar_url?: string;
  is_admin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "avatar_url"
  | "is_admin"
  | "gender"
  | "address_bis"
  | "createdAt"
  | "updatedAt"
>;

export interface VehiculeAttributes {
  id: string;
  name: string;
  license_plate: string | null;
  color: string | null;
  id_plug: string;
  id_user: string;
  createdAt?: Date;
  updatedAt?: Date;
  photo_url?: string;
}
export type VehiculeCreationAttributes = Optional<
  VehiculeAttributes,
  "id" | "createdAt" | "updatedAt" | "license_plate" | "color"
>;
