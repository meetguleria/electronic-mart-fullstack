'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ElectronicsItems', [
      {
        item_name: 'Apple iPhone 13 Pro Max',
        item_quantity: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'Samsung Galaxy S21 Ultra',
        item_quantity: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'Sony WH-1000XM4 Wireless Headphones',
        item_quantity: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'Dell XPS 13 Laptop',
        item_quantity: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        item_name: 'GoPro HERO10 Black Action Camera',
        item_quantity: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ElectronicsItems', {
      item_name: [
        'Apple iPhone 13 Pro Max',
        'Samsung Galaxy S21 Ultra',
        'Sony WH-1000XM4 Wireless Headphones',
        'Dell XPS 13 Laptop',
        'GoPro HERO10 Black Action Camera'
      ]
    }, {});
  }
};
