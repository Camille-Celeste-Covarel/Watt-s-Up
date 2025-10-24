/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("terminal", "type_de_prise", {
        transaction,
      });
      await queryInterface.removeColumn("terminal", "prise_type_2", {
        transaction,
      });
      await queryInterface.removeColumn("terminal", "prise_type_ef", {
        transaction,
      });
      await queryInterface.removeColumn("terminal", "prise_chademo", {
        transaction,
      });
      await queryInterface.removeColumn("terminal", "prise_combo_ccs", {
        transaction,
      });
      await queryInterface.removeColumn("terminal", "prise_autre", {
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "terminal",
        "type_de_prise",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "terminal",
        "prise_type_2",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "terminal",
        "prise_type_ef",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "terminal",
        "prise_chademo",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "terminal",
        "prise_combo_ccs",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        { transaction },
      );
      await queryInterface.addColumn(
        "terminal",
        "prise_autre",
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
