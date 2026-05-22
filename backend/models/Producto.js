const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Producto = sequelize.define('Producto', {
  id:           { type: DataTypes.INTEGER,       primaryKey: true, autoIncrement: true },
  nombre:       { type: DataTypes.STRING(200),   allowNull: false },
  descripcion:  { type: DataTypes.TEXT,          allowNull: true },
  precio:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock:        { type: DataTypes.INTEGER,       allowNull: false, defaultValue: 0 },
  categoria_id: { type: DataTypes.INTEGER,       allowNull: false },
  proveedor_id: { type: DataTypes.INTEGER,       allowNull: false },
}, {
  tableName:  'productos',
  timestamps: false,
});

module.exports = Producto;
