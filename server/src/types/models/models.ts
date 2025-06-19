import type * as GeoJSON from "geojson";
import type { Optional } from "sequelize";

export interface StationAttributes {
  id: number;
  id_station_itinerance: string | null;
  id_access: number | null;
  id_provider: number | null;
  id_book: number | null;
  id_station_local: string | null;
  nom_amenageur: string | null;
  siren_amenageur: string | null;
  contact_amenageur: string | null;
  nom_operateur: string | null;
  id_operator: number | null;
  contact_operateur: string | null;
  telephone_operateur: string | null;
  nom_enseigne: string | null;
  id_compagny: number | null;
  nom_station: string;
  implantation_station: string | null;
  adresse_station: string | null;
  code_insee_commune: string | null;
  nbre_pdc: number | null;
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
  coordonneesXY: string | null;
  geom: GeoJSON.Point | null;
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
  | "id_book"
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
  | "coordonneesXY"
  | "geom"
>;

export interface TerminalAttributes {
  id: number;
  idStation: number;
  idBook: number | null;
  idPower: number | null;
  id_pdc_itinerance: string | null;
  id_pdc_local: string | null;
  latitude: number | null;
  longitude: number | null;
  geom: GeoJSON.Point | null;
  typeDePrise: string;
  puissanceNominale: number;
  priseType2: boolean;
  priseTypeEf: boolean;
  priseChademo: boolean;
  priseComboCcs: boolean;
  priseAutre: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TerminalCreationAttributes = Optional<
  TerminalAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "idBook"
  | "idPower"
  | "id_pdc_itinerance"
  | "id_pdc_local"
  | "latitude"
  | "longitude"
  | "geom"
  | "priseAutre"
  | "status"
>;

export interface TerminalPlugAttributes {
  idPlug: number;
  idTerminal: number;
}

export type TerminalPlugCreationAttributes = Optional<
  TerminalPlugAttributes,
  never
>;

export interface AccessAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type AccessCreationAttributes = Optional<
  AccessAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface CompagnyAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type CompagnyCreationAttributes = Optional<
  CompagnyAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface OperatorAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type OperatorCreationAttributes = Optional<
  OperatorAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface ProviderAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ProviderCreationAttributes = Optional<
  ProviderAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface PlugAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type PlugCreationAttributes = Optional<
  PlugAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface PowerAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type PowerCreationAttributes = Optional<
  PowerAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export interface BookAttributes {
  id: number;
  startTime: Date | null;
  price: number | null;
  actived: boolean | null;
  idUser: number;
  idTerminal: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export type BookCreationAttributes = Optional<
  BookAttributes,
  "id" | "createdAt" | "updatedAt" | "startTime" | "price" | "actived"
>;

export interface RequestAttributes {
  id: number;
  message: string | null;
  dateRequest: Date | null;
  status: string | null;
  response: string | null;
  idUser: number;
  idTerminal: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export type RequestCreationAttributes = Optional<
  RequestAttributes,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "message"
  | "dateRequest"
  | "status"
  | "response"
>;

export interface ObservationAttributes {
  id: number;
  comment: string | null;
  idStation: number;
  idUser: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ObservationCreationAttributes = Optional<
  ObservationAttributes,
  "id" | "createdAt" | "updatedAt" | "comment"
>;

export interface VehiculeAttributes {
  id: number;
  name: string;
  licensePlate: string | null;
  color: string | null;
  idPlug: number;
  idUser: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export type VehiculeCreationAttributes = Optional<
  VehiculeAttributes,
  "id" | "createdAt" | "updatedAt" | "licensePlate" | "color"
>;

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender?: "Femme" | "Homme" | "Autre";
  birthdate: Date;
  address: string;
  addressBis?: string;
  city: string;
  postcode: string;
  country: string;
  password: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  | "id"
  | "avatarUrl"
  | "isAdmin"
  | "gender"
  | "addressBis"
  | "createdAt"
  | "updatedAt"
>;

export interface ImportLogAttributes {
  id: number;
  importId: string;
  fileName: string;
  totalLinesProcessed: number;
  successfulLines: number;
  errorSummary: object | null;
  errorLogFilePath: string | null;
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  importDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export type ImportLogCreationAttributes = Optional<
  ImportLogAttributes,
  "id" | "createdAt" | "updatedAt"
>;
