import { DataTypes, Model, type Sequelize } from "sequelize";
import type { Optional } from "sequelize";
import type { ImportLogAttributes } from "../types/models/models";

export type ImportLogCreationAttributes = Optional<
  ImportLogAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class ImportLog
  extends Model<ImportLogAttributes, ImportLogCreationAttributes>
  implements ImportLogAttributes
{
  public id!: number;
  public importId!: string;
  public fileName!: string;
  public totalLinesProcessed!: number;
  public successfulLines!: number;
  public errorSummary!: object | null;
  public errorLogFilePath!: string | null;
  public status!: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  public importDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): void {
    ImportLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        importId: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
        },
        fileName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        totalLinesProcessed: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        successfulLines: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        errorSummary: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        errorLogFilePath: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("SUCCESS", "PARTIAL_SUCCESS", "FAILED"),
          allowNull: false,
        },
        importDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "import_logs",
        timestamps: true,
      },
    );
  }

  static associate(): void {}
}
