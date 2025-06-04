const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const User = require('./models/user'); // ✅ Asegúrate de que la ruta sea correcta

mongoose.connect('mongodb://localhost:27017/LoginConExpress', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const nuevoAdmin = new User({
  email: 'blancarivera0123@gmail.com',
  name: 'Blanca Rivera',
  rol: 'admin',
  password: bcrypt.hashSync('123456', bcrypt.genSaltSync(10), null)
});

nuevoAdmin.save()
  .then(() => {
    console.log('✅ Usuario administrador creado con éxito');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error al crear el usuario:', err);
    mongoose.disconnect();
  });
