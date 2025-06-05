const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Pedido = require('../models/order');
const multer = require('multer');
const path = require('path');

// Configuración para subir imágenes de perfil
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

// Middleware de autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Mostrar el perfil con pedidos
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).lean();
    const pedidos = await Pedido.find({ usuario: req.user._id }).populate('productos.producto').lean();

    res.render('perfil', {
      usuario,
      pedidos,
      exito: req.flash('exito'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    req.flash('error', 'Error al cargar el perfil');
    res.redirect('/');
  }
});

// Formulario para editar perfil
router.get('/editar', isAuthenticated, async (req, res) => {
  const usuario = await User.findById(req.user._id);
  res.render('editarPerfil', { usuario });
});

// Formulario para agregar método de pago
router.get('/agregar-metodo-pago', isAuthenticated, (req, res) => {
  res.render('agregarMetodoPago', { layout: 'layout/layout.ejs' });
});

// Guardar nuevo método de pago
router.post('/agregar-metodo-pago', isAuthenticated, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/perfil');
    }

    const { cardType, cardNumber, expiryDate, cvv, cardholderName } = req.body;
    const cleanCardNumber = cardNumber.replace(/\s+/g, '');

    usuario.paymentMethods.push({
      cardType,
      cardNumber: cleanCardNumber,
      expiryDate,
      cvv,
      cardholderName,
      isDefault: usuario.paymentMethods.length === 0
    });

    await usuario.save();
    req.flash('exito', 'Método de pago agregado correctamente');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al guardar método de pago:', error);
    req.flash('error', 'Error al guardar el método de pago');
    res.redirect('/perfil');
  }
});

// Guardar cambios de perfil
router.post('/editar', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country
    } = req.body;

    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/perfil');
    }

    usuario.name = name;
    usuario.phoneNumber = phoneNumber;

    if (req.file) {
      usuario.profilePicture = '/uploads/perfiles/' + req.file.filename;
    }

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

    await usuario.save();
    req.flash('exito', 'Perfil actualizado correctamente');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error actualizando el perfil:', error);
    req.flash('error', 'Error al actualizar el perfil');
    res.redirect('/perfil');
  }
});

// Eliminar método de pago
router.post('/eliminar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const usuario = await User.findById(req.user._id);

    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      return res.redirect('/perfil');
    }

    if (isNaN(index) || index < 0 || index >= usuario.paymentMethods.length) {
      req.flash('error', 'Índice inválido');
      return res.redirect('/perfil');
    }

    usuario.paymentMethods.splice(index, 1);
    await usuario.save();

    req.flash('exito', 'Método de pago eliminado');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    req.flash('error', 'Error al eliminar el método de pago');
    res.redirect('/perfil');
  }
});

// Cancelar pedido si está pendiente
router.post('/cancelar-pedido/:id', isAuthenticated, async (req, res) => {
  try {
    const pedido = await Pedido.findOne({ _id: req.params.id, usuario: req.user._id });

    if (!pedido) {
      req.flash('error', 'Pedido no encontrado');
      return res.redirect('/perfil');
    }

    if (pedido.estado === 'pendiente') {
      pedido.estado = 'cancelado';
      await pedido.save();
      req.flash('exito', 'Pedido cancelado correctamente');
    } else {
      req.flash('error', 'El pedido no puede cancelarse');
    }

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    req.flash('error', 'Error al cancelar el pedido');
    res.redirect('/perfil');
  }
});

module.exports = router;

