const express     = require('express');
const cors        = require('cors');
require('dotenv').config();

const authRouter        = require('./routes/auth');
const categoriasRouter  = require('./routes/categorias');
const proveedoresRouter = require('./routes/proveedores');
const clientesRouter    = require('./routes/clientes');
const empleadosRouter   = require('./routes/empleados');
const productosRouter   = require('./routes/productos');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',        authRouter);
app.use('/api/categorias',  categoriasRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/clientes',    clientesRouter);
app.use('/api/empleados',   empleadosRouter);
app.use('/api/productos',   productosRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
