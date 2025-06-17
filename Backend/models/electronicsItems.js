module.exports = (sequelize, DataTypes) => {
  const ElectronicsItem = sequelize.define('ElectronicsItem',  {
    item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    item_name: { type: DataTypes.STRING(255), allowNull: false },
    item_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  });

  return ElectronicsItem;
};