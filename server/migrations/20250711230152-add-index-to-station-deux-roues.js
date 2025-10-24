/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Commande pour ajouter l'index à la table 'station' sur la colonne 'station_deux_roues'.
     */
    await queryInterface.addIndex("station", ["station_deux_roues"], {
      name: "idx_station_station_deux_roues",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Commande pour supprimer l'index si on annule la migration.
     */
    await queryInterface.removeIndex(
      "station",
      "idx_station_station_deux_roues",
    );
  },
};
