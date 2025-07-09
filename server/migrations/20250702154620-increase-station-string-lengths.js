/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("station", "id_station_itinerance", {
      type: Sequelize.STRING(500),
      allowNull: true,
      unique: true,
    });

    // nom_station
    await queryInterface.changeColumn("station", "nom_station", {
      type: Sequelize.STRING(500),
      allowNull: false,
    });

    await queryInterface.changeColumn("station", "tarification", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("station", "id_station_itinerance", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
    await queryInterface.changeColumn("station", "nom_station", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
    await queryInterface.changeColumn("station", "tarification", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
