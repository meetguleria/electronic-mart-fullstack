module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'roles',
    timestamps: true
  });
  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role_id' });
  };
  return Role;
};