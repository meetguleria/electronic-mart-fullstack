'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add the column as NULLABLE to avoid immediate constraint errors
    await queryInterface.addColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Backfill all existing rows with a safe default (here: empty string)
    await queryInterface.sequelize.query(
      `UPDATE "users" SET "password" = '' WHERE "password" IS NULL;`
    );

    // 3. Now alter the column to enforce NOT NULL
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert by dropping the column
    await queryInterface.removeColumn('users', 'password');
  }
};