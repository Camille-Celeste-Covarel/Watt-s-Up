/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user", "reset_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("user", "reset_token_expiry", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "reset_token");
    await queryInterface.removeColumn("user", "reset_token_expiry");
  },
};
