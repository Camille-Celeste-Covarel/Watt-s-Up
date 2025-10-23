module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeConstraint('book', 'book_id_terminal_fkey');
        } catch (error) {
            console.log("Constraint 'book_id_terminal_fkey' not found or already removed, proceeding...");
        }

        await queryInterface.addConstraint('book', {
            fields: ['id_terminal'],
            type: 'foreign key',
            name: 'book_id_terminal_fkey',
            references: {
                table: 'terminal',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('book', 'book_id_terminal_fkey');

        await queryInterface.addConstraint('book', {
            fields: ['id_terminal'],
            type: 'foreign key',
            name: 'book_id_terminal_fkey',
            references: {
                table: 'terminal',
                field: 'id',
            },
        });
    },
};
    