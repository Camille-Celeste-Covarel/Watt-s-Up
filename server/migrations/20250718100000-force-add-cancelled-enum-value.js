/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const enumName = "enum_import_log_status";
    const valueToAdd = "CANCELLED";

    // Utilise une transaction pour assurer l'intégrité
    const transaction = await queryInterface.sequelize.transaction();
    try {
      console.log(
        `Forcing addition of value '${valueToAdd}' to ENUM '${enumName}'.`,
      );
      // Ceci est la commande SQL brute pour PostgreSQL pour ajouter une valeur à un type ENUM existant.
      // L'option 'IF NOT EXISTS' la rend sûre à ré-exécuter.
      await queryInterface.sequelize.query(
        `ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS '${valueToAdd}'`,
        { transaction },
      );
      await transaction.commit();
      console.log(
        `Successfully added value '${valueToAdd}' to ENUM '${enumName}'.`,
      );
    } catch (e) {
      await transaction.rollback();
      console.error(`Failed to add value to ENUM: ${e.message}`);
      // On propage l'erreur pour que la migration échoue formellement si besoin
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    // ATTENTION: La suppression d'une valeur d'un ENUM en PostgreSQL est une opération complexe et destructive.
    // Nous laissons intentionnellement cette fonction 'down' vide pour éviter des suppressions accidentelles de données.
    // Si une annulation est nécessaire, elle doit être faite manuellement avec précaution.
    console.log(
      '"down" migration for force-add-cancelled-enum-value is intentionally left empty.',
    );
  },
};
