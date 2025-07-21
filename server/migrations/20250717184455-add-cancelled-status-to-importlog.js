/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("import_log", "status", {
      type: Sequelize.ENUM(
        "IN_PROGRESS",
        "COMPLETED",
        "PARTIAL_SUCCESS",
        "FAILED",
        "CANCELLED",
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("import_log", "status", {
      type: Sequelize.ENUM(
        "IN_PROGRESS",
        "COMPLETED",
        "PARTIAL_SUCCESS",
        "FAILED",
      ),
      allowNull: false,
    });
  },
};
