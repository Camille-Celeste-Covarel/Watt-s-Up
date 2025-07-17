/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("import_log", "duration_ms", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "import_date",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("import_log", "duration_ms");
  },
};
