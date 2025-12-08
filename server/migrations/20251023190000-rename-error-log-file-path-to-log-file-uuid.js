/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "import_log",
      "error_log_file_path",
      "log_file_uuid",
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE "import_log"
      ALTER COLUMN "log_file_uuid" TYPE UUID
      USING CAST(substring("log_file_uuid" from '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}') AS UUID);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("import_log", "log_file_uuid", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.renameColumn(
      "import_log",
      "log_file_uuid",
      "error_log_file_path",
    );
  },
};
