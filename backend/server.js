const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Ruta de salud — útil para verificar que el servidor responde
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
