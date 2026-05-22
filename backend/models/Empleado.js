const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Empleado = sequelize.define('Empleado', {
  id:       { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  nombre:   { type: DataTypes.STRING(150),  allowNull: false },
  telefono: { type: DataTypes.STRING(20),   allowNull: true },
  email:    { type: DataTypes.STRING(150),  allowNull: true, unique: true },
  puesto:   { type: DataTypes.STRING(100),  allowNull: false },
}, {
  tableName:  'empleados',
  timestamps: false,
});

module.exports = Empleado;
