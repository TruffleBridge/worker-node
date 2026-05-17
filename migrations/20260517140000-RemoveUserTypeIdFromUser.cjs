'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('User');
    if (table.userTypeId) {
      await queryInterface.removeColumn('User', 'userTypeId');
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('User');
    if (!table.userTypeId) {
      await queryInterface.addColumn('User', 'userTypeId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Role',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },
};
