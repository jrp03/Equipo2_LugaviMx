// src/rutas/perfil.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware de autenticación correcto
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Mostrar el perfil
router.get('/', isAuthenticated, async (req, res) => {
  const usuario = await User.findById(req.user._id);
  res.render('perfil', { usuario });
});

// Formulario para editar el perfil
router.get('/editar', isAuthenticated, async (req, res) => {
  const usuario = await User.findById(req.user._id);
  res.render('editarPerfil', { usuario });
});
//Formulario para agregar metodos de pago
router.get('/agregar-metodo-pago', isAuthenticated, (req, res) => {
  res.render('agregarMetodoPago', { layout: 'layout/layout.ejs' });
});
router.post('/agregar-metodo-pago', isAuthenticated, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    const { cardType, cardNumber, expiryDate, cvv, cardholderName } = req.body;

    usuario.paymentMethods.push({
      cardType,
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
      isDefault: usuario.paymentMethods.length === 0 // El primero que agregue será el predeterminado
    });

    await usuario.save();

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al guardar método de pago:', error);
    res.status(500).send('Error al guardar el método de pago');
  }
});

// Guardar los cambios del perfil
router.post('/editar', isAuthenticated, async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    const {
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      paymentMethods = []
    } = req.body;

    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    usuario.name = name;
    usuario.phoneNumber = phoneNumber;

    // Dirección
    const direccion = {
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: true
    };

    if (usuario.shippingAddresses.length > 0) {
      usuario.shippingAddresses[0] = direccion;
    } else {
      usuario.shippingAddresses.push(direccion);
    }

    // Filtrar métodos de pago válidos
    const parsedPaymentMethods = Object.values(paymentMethods).filter(pm => (
      pm.cardType && pm.cardNumber && pm.expiryDate && pm.cvv && pm.cardholderName
    ));

    usuario.paymentMethods = parsedPaymentMethods;

    await usuario.save();
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error actualizando el perfil:', error);
    res.status(500).send('Error al actualizar el perfil');
  }
});



module.exports = router;
