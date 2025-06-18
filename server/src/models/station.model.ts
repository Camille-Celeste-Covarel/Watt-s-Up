import { Model, DataTypes, Sequelize } from 'sequelize';
import { Access } from './access.model';
import { Provider } from './provider.model';
import { Book } from './book.model';
import { Terminal } from './terminal.model';

export class Station extends Model {
    public id!: number;
    public id_station_itinerance?: string;
    public id_access?: number;
    public id_provider?: number;
    public id_book?: number;
    public nom_amenageur?: string;
    public siren_amenageur?: string;
    public contact_amenageur?: string;
    public nom_operateur?: string;
    public contact_operateur?: string;
    public telephone_operateur?: string;
    public nom_enseigne?: string;
    public id_station_local?: string;
    public nom_station!: string;
    public implantation_station?: string;
    public adresse_station?: string;
    public code_insee_commune?: string;
    public nbre_pdc?: number;
    public gratuit?: boolean;
    public paiement_acte?: boolean;
    public paiement_cb?: boolean;
    public paiement_autre?: string;
    public tarification?: string;
    public condition_acces?: string;
    public reservation?: boolean;
    public horaires?: string;
    public accessibilite_pmr?: string;
    public restriction_gabarit?: string;
    public station_deux_roues?: boolean;
    public raccordement?: string;
    public num_pdl?: string;
    public date_mise_en_service?: Date;
    public observations?: string;
    public date_maj?: Date;
    public cable_t2_attache?: boolean;
    public last_modified?: Date;
    public datagouv_dataset_id?: string;
    public datagouv_resource_id?: string;
    public datagouv_organization_or_owner?: string;
    public consolidated_latitude?: number;
    public consolidated_longitude?: number;
    public consolidated_code_postal?: string;
    public consolidated_commune?: string;
    public consolidated_is_lon_lat_correct?: boolean;
    public consolidated_is_code_insee_verified?: boolean;
    public consolidated_is_code_insee_modified?: boolean;
    public coordonneesXY?: string;
    public geom?: object;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                id_station_itinerance: {
                    type: DataTypes.STRING(255),
                    unique: true,
                    allowNull: true,
                },
                id_access: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                id_provider: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                id_book: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                nom_amenageur: DataTypes.STRING(255),
                siren_amenageur: DataTypes.STRING(255),
                contact_amenageur: DataTypes.STRING(255),
                nom_operateur: DataTypes.STRING(255),
                contact_operateur: DataTypes.STRING(255),
                telephone_operateur: DataTypes.STRING(255),
                nom_enseigne: DataTypes.STRING(255),
                id_station_local: DataTypes.STRING(255),
                nom_station: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                implantation_station: DataTypes.STRING(255),
                adresse_station: DataTypes.STRING(255),
                code_insee_commune: DataTypes.STRING(255),
                nbre_pdc: DataTypes.INTEGER,
                gratuit: DataTypes.BOOLEAN, // Correspond à BOOLEAN (tinyint(1) dans MySQL)
                paiement_acte: DataTypes.BOOLEAN,
                paiement_cb: DataTypes.BOOLEAN,
                paiement_autre: DataTypes.STRING(255),
                tarification: DataTypes.STRING(255),
                condition_acces: DataTypes.STRING(255),
                reservation: DataTypes.BOOLEAN,
                horaires: DataTypes.STRING(255),
                accessibilite_pmr: DataTypes.STRING(255),
                restriction_gabarit: DataTypes.STRING(255),
                station_deux_roues: DataTypes.BOOLEAN,
                raccordement: DataTypes.STRING(255),
                num_pdl: DataTypes.STRING(255),
                date_mise_en_service: DataTypes.DATE,
                observations: DataTypes.TEXT,
                date_maj: DataTypes.DATE,
                cable_t2_attache: DataTypes.BOOLEAN,
                last_modified: DataTypes.DATE,
                datagouv_dataset_id: DataTypes.STRING(255),
                datagouv_resource_id: DataTypes.STRING(255),
                datagouv_organization_or_owner: DataTypes.STRING(255),
                consolidated_latitude: DataTypes.DOUBLE,
                consolidated_longitude: DataTypes.DOUBLE,
                consolidated_code_postal: DataTypes.STRING(255),
                consolidated_commune: DataTypes.STRING(255),
                consolidated_is_lon_lat_correct: DataTypes.BOOLEAN,
                consolidated_is_code_insee_verified: DataTypes.BOOLEAN,
                consolidated_is_code_insee_modified: DataTypes.BOOLEAN,
                coordonneesXY: DataTypes.STRING(255),
                geom: DataTypes.GEOMETRY('POINT', 4326),
            },
            {
                sequelize,
                tableName: 'station',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Station.belongsTo(Access, { foreignKey: 'idAccess', as: 'access' });
        Station.belongsTo(Provider, { foreignKey: 'idProvider', as: 'provider' });
        Station.belongsTo(Book, { foreignKey: 'idBook', as: 'book' });
        Station.hasMany(Terminal, { foreignKey: 'idStation', as: 'terminals' });
    }
}