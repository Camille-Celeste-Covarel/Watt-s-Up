/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("import_log", "log_file_uuid", {
      type: Sequelize.UUID,
      allowNull: true,
      after: "import_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("import_log", "log_file_uuid");
  },
};
