const ReservationStatus = {
  ACTIVE: "ACTIVE",
  IN_USE: "IN_USE",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Supprimer la table de jonction qui n'est plus utile
      await queryInterface.dropTable("book_terminal", { transaction });

      // 2. Supprimer les anciennes colonnes du modèle Book
      await queryInterface.removeColumn("book", "start_time", { transaction });
      await queryInterface.removeColumn("book", "actived", { transaction });

      // 3. Ajouter les nouvelles colonnes
      await queryInterface.addColumn(
        "book",
        "id_terminal",
        {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "terminal",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "book",
        "status",
        {
          type: Sequelize.ENUM(...Object.values(ReservationStatus)),
          allowNull: false,
          defaultValue: ReservationStatus.ACTIVE,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "book",
        "expires_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        "book",
        "session_ends_at",
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn("book", "id_terminal", {
        transaction,
      });
      await queryInterface.removeColumn("book", "status", { transaction });
      await queryInterface.removeColumn("book", "expires_at", { transaction });
      await queryInterface.removeColumn("book", "session_ends_at", {
        transaction,
      });

      // 2. Rajouter les anciennes colonnes
      await queryInterface.addColumn(
        "book",
        "start_time",
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "book",
        "actived",
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        { transaction },
      );

      // 3. Recréer l'ancienne table de jonction
      await queryInterface.createTable(
        "book_terminal",
        {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          id_book: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "book", key: "id" },
          },
          id_terminal: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "terminal", key: "id" },
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );
    });
  },
};
