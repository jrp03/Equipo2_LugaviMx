const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Asegúrate que la ruta sea correcta

// Middleware para asegurarte que el usuario esté autenticado
function asegurarAutenticado(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Mostrar el perfil
router.get('/', asegurarAutenticado, async (req, res) => {
  const usuario = await User.findById(req.user._id);
  res.render('perfil', { usuario });
});

// Mostrar el formulario de edición
router.get('/editar', asegurarAutenticado, async (req, res) => {
  const usuario = await User.findById(req.user._id);
  res.render('editarPerfil', { usuario });
});

// Guardar los cambios del perfil
router.post('/editar', asegurarAutenticado, async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    shippingAddresses = [],
    paymentMethods = []
  } = req.body;

  try {
    // Construir el objeto de actualización
    const update = {
      name,
      email,
      phoneNumber,
      shippingAddresses: Array.isArray(shippingAddresses)
        ? shippingAddresses
        : Object.values(shippingAddresses),
      paymentMethods: Array.isArray(paymentMethods)
        ? paymentMethods
        : Object.values(paymentMethods)
    };

    await User.findByIdAndUpdate(req.user._id, update, { new: true });

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error actualizando el perfil:', error);
    res.status(500).send('Ocurrió un error al actualizar el perfil.');
  }
});

module.exports = router;
