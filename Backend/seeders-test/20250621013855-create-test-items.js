'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ElectronicsItems', [
      {
        item_name: 'Test Laptop',
        item_quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'Test Smartphone',
        item_quantity: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'Test Headphones',
        item_quantity: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ElectronicsItems', null, {});
  }
};
