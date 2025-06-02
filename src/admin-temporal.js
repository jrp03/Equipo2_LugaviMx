const mongoose = require('mongoose');
const User = require('./models/user'); // Asegúrate que esta ruta es correcta
require('dotenv').config();

// Conexión a tu base de datos (usa tu URI real si usas variables de entorno)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/LoginConExpress', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function convertirEnAdmin() {
  await User.updateOne(
    { email: 'admin@lugavi.com' }, // Reemplaza con el correo real
    { $set: { role: 'admin' } }
  );
  console.log('✅ Usuario actualizado a admin');
  mongoose.disconnect(); // Cierra la conexión después
}

convertirEnAdmin();
