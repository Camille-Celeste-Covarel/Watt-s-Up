// src/models/request.model.ts

import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { User } from './user.model';
import { Terminal } from './terminal.model';

interface RequestAttributes {
    id: number;
    message: string;
    dateRequest: Date;
    status: 'pending' | 'accepted' | 'rejected';
    response?: string;
    idUser: number;
    idTerminal?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RequestCreationAttributes extends Optional<RequestAttributes, 'id' | 'response' | 'idTerminal' | 'createdAt' | 'updatedAt'> {}

export class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
    public id!: number;
    public message!: string;
    public dateRequest!: Date;
    public status!: 'pending' | 'accepted' | 'rejected';
    public response?: string;
    public idUser!: number;
    public idTerminal?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Request.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                dateRequest: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    field: 'date_request',
                },
                status: {
                    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
                    allowNull: false,
                    defaultValue: 'pending',
                },
                response: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                idUser: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'id_user',
                },
                idTerminal: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'id_terminal',
                },
            },
            {
                sequelize,
                tableName: 'request',
                timestamps: true,
                underscored: true,
            }
        );
    }

    static associate() {
        Request.belongsTo(User, { foreignKey: 'idUser', as: 'user' });
        Request.belongsTo(Terminal, { foreignKey: 'idTerminal', as: 'terminal' });
    }
}