'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User', 'authProvider', {
      type: Sequelize.ENUM('local', 'google', 'facebook'),
      allowNull: false,
      defaultValue: 'local',
    });

    await queryInterface.addColumn('User', 'providerId', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('User', 'profilePicture', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn('User', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.changeColumn('User', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn('User', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addIndex('User', ['authProvider', 'providerId'], {
      unique: true,
      name: 'user_auth_provider_provider_id_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('User', 'user_auth_provider_provider_id_unique');
    await queryInterface.removeColumn('User', 'emailVerified');
    await queryInterface.removeColumn('User', 'profilePicture');
    await queryInterface.removeColumn('User', 'providerId');
    await queryInterface.removeColumn('User', 'authProvider');

    await queryInterface.changeColumn('User', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn('User', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: false,
    });
  },
};
