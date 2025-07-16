import { DataTypes } from "sequelize";

export default {
  async up(queryInterface) {
    await queryInterface.addColumn("book", "charge_started_at", {
      type: DataTypes.DATE,
      allowNull: true,
      after: "expires_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("book", "charge_started_at");
  },
};
