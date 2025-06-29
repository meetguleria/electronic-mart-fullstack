'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { role_name: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { role_name: 'user', createdAt: new Date(), updatedAt: new Date() },
      { role_name: 'moderator', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      role_name: ['admin', 'user', 'moderator']
    }, {});
  }
};
