module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeConstraint('terminal_plug', 'terminal_plug_id_terminal_fkey');
        } catch (error) {
            console.log("Constraint 'terminal_plug_id_terminal_fkey' not found or already removed, proceeding...");
        }

        await queryInterface.addConstraint('terminal_plug', {
            fields: ['id_terminal'],
            type: 'foreign key',
            name: 'terminal_plug_id_terminal_fkey',
            references: {
                table: 'terminal',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('terminal_plug', 'terminal_plug_id_terminal_fkey');

        await queryInterface.addConstraint('terminal_plug', {
            fields: ['id_terminal'],
            type: 'foreign key',
            name: 'terminal_plug_id_terminal_fkey',
            references: {
                table: 'terminal',
                field: 'id',
            },
        });
    },
};
    