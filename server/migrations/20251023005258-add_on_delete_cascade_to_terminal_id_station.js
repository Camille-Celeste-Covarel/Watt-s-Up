module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeConstraint('terminal', 'terminal_id_station_fkey');
        } catch (error) {
            console.log("Constraint 'terminal_id_station_fkey' not found or already removed, proceeding...");
        }

        await queryInterface.addConstraint('terminal', {
            fields: ['id_station'],
            type: 'foreign key',
            name: 'terminal_id_station_fkey',
            references: {
                table: 'station',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('terminal', 'terminal_id_station_fkey');

        await queryInterface.addConstraint('terminal', {
            fields: ['id_station'],
            type: 'foreign key',
            name: 'terminal_id_station_fkey',
            references: {
                table: 'station',
                field: 'id',
            },
        });
    },
};
    