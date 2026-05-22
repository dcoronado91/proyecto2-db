const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Categoria = sequelize.define('Categoria', {
  id:          { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  nombre:      { type: DataTypes.STRING(100),  allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT,         allowNull: true },
}, {
  tableName:  'categorias',
  timestamps: false,
});

module.exports = Categoria;
