const sequelize  = require('../sequelize');
const Categoria  = require('./Categoria');
const Proveedor  = require('./Proveedor');
const Cliente    = require('./Cliente');
const Empleado   = require('./Empleado');
const Producto   = require('./Producto');

// Asociaciones
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Categoria.hasMany(Producto,   { foreignKey: 'categoria_id' });
Proveedor.hasMany(Producto,   { foreignKey: 'proveedor_id' });

module.exports = { sequelize, Categoria, Proveedor, Cliente, Empleado, Producto };
