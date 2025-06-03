// src/rutas/perfil.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/perfiles'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
router.post('/editar', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
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

    // ✅ Guardar imagen si se subió
    if (req.file) {
      usuario.profilePicture = '/uploads/perfiles/' + req.file.filename;
    }

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

    // Métodos de pago válidos
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
      isDefault: usuario.paymentMethods.length === 0
    });

    await usuario.save();
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al guardar método de pago:', error);
    res.status(500).send('Error al guardar el método de pago');
  }
});


router.post('/eliminar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const usuario = await User.findById(req.user._id);

    if (!usuario) return res.status(404).send('Usuario no encontrado');

    if (isNaN(index) || index < 0 || index >= usuario.paymentMethods.length) {
      return res.status(400).send('Índice inválido');
    }

    usuario.paymentMethods.splice(index, 1);
    await usuario.save();

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).send('Error al eliminar el método de pago');
  }
});

router.get('/agregar-metodo-pago', isAuthenticated, (req, res) => {
  res.render('agregarMetodoPago', { layout: 'layout/layout.ejs' });
});



module.exports = router;
