/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = "terminal";
    const columnName = "is_booked";

    const table = await queryInterface.describeTable(tableName);

    if (!table[columnName]) {
      console.log(`Adding column "${columnName}" to table "${tableName}"...`);
      await queryInterface.addColumn(tableName, columnName, {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    } else {
      console.log(`Column "${columnName}" already exists in table "${tableName}". Skipping.`);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = "terminal";
    const columnName = "is_booked";

    const table = await queryInterface.describeTable(tableName);
    if (table[columnName]) {
      await queryInterface.removeColumn(tableName, columnName);
    }
  },
};
    