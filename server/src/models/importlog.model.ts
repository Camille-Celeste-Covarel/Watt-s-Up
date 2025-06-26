import { DataTypes, Model, type Sequelize } from "sequelize";
import type {
  ImportLogAttributes,
  ImportLogCreationAttributes,
} from "../types/models/models";

export class ImportLog
  extends Model<ImportLogAttributes, ImportLogCreationAttributes>
  implements ImportLogAttributes
{
  public id!: string;
  public import_id!: string;
  public file_name!: string;
  public total_lines_processed!: number;
  public successful_lines!: number;
  public error_summary!: ImportLogAttributes["error_summary"];
  public error_log_file_path!: string | null;
  public status!: "IN_PROGRESS" | "COMPLETED" | "PARTIAL_SUCCESS" | "FAILED";
  public import_date!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    ImportLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        import_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        file_name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        total_lines_processed: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        successful_lines: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        error_summary: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        error_log_file_path: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(
            "IN_PROGRESS",
            "COMPLETED",
            "PARTIAL_SUCCESS",
            "FAILED",
          ),
          allowNull: false,
        },
        import_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "import_log",
        timestamps: true,
        underscored: true,
        modelName: "ImportLog",
      },
    );
  }

  static associate() {}
}
