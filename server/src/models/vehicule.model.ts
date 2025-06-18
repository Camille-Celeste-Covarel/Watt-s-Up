import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { Plug } from './plug.model';
import { User } from './user.model';

interface VehiculeAttributes {
    id:
        number;
    name: string;
    licensePlate: string;
    color: string;
    idPlug: number;
    idUser: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface VehiculeCreationAttributes extends Optional<VehiculeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Vehicule extends Model<VehiculeAttributes, VehiculeCreationAttributes> implements VehiculeAttributes {
    public id!: number;
    public name!: string;
    public licensePlate!: string;
    public color!: string;
    public idPlug!: number;
    public idUser!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Vehicule.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                licensePlate: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                    unique: true,
                    field: 'license_plate',
                },
                color: {
                    type: DataTypes.STRING(128),
                    allowNull: false,
                },
                idPlug: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'id_plug',
                },
                idUser: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'id_user',
                },
            },
            {
                sequelize,
                tableName: 'vehicule',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Vehicule.belongsTo(Plug, { foreignKey: 'idPlug', as: 'plug' });
        Vehicule.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
    }
}