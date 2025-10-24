const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wattsup.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'WattsupAdmin123!';

    // Vérifie si l'utilisateur admin existe déjà
    const user = await queryInterface.rawSelect(
      'user',
      {
        where: {
          email: adminEmail,
        },
      },
      ['id']
    );

    if (!user) {
      console.log(`Creating admin user with email: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await queryInterface.bulkInsert('user', [
        {
          id: uuidv4(),
          first_name: 'Louise',
          last_name: 'Lorraine-Vaudémont',
          email: adminEmail,
          birthdate: new Date('1990-01-01'),
          address: 'château de Nomeny',
          city: 'Nomeny',
          postcode: '54610',
          country: 'FR',
          password: hashedPassword,
          is_admin: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    } else {
      console.log('Admin user already exists. Skipping creation.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wattsup.com';
    await queryInterface.bulkDelete('user', { email: adminEmail });
  },
};
