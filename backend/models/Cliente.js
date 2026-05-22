const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Cliente = sequelize.define('Cliente', {
  id:        { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(150),  allowNull: false },
  telefono:  { type: DataTypes.STRING(20),   allowNull: true },
  email:     { type: DataTypes.STRING(150),  allowNull: true, unique: true },
  direccion: { type: DataTypes.TEXT,         allowNull: true },
}, {
  tableName:  'clientes',
  timestamps: false,
});

module.exports = Cliente;
