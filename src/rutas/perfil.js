const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const User = require('../models/user');
const Pedido = require('../models/order');
const { isAuthenticated } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/perfiles')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'perfil-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).lean();
    const pedidos = await Pedido.find({ usuario: req.user._id })
                                .populate('productos.producto')
                                .lean();

    res.render('perfil', {
      usuario,
      pedidos,
      exito: req.flash('exito'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    res.status(500).send('Error al cargar el perfil.');
  }
});

router.get('/agregar-metodo-pago', isAuthenticated, (req, res) => {
  res.render('agregarMetodoPago', {
    exito: req.flash('exito'),
    error: req.flash('error')
  });
});

router.post('/agregar-metodo-pago', isAuthenticated, async (req, res) => {
  const { cardType, cardNumber, expiryDate, cardholderName, isDefault } = req.body;

  try {
    const usuario = await User.findById(req.user._id);

    if (!cardType || !cardNumber || !expiryDate || !cardholderName) {
      req.flash('error', 'Todos los campos son obligatorios.');
      return res.redirect('/perfil/agregar-metodo-pago');
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.length !== 16 || !/^\d+$/.test(cleanNumber)) {
      req.flash('error', 'El número de tarjeta debe tener 16 dígitos numéricos.');
      return res.redirect('/perfil/agregar-metodo-pago');
    }

    const nuevoMetodo = {
      cardType,
      cardNumber: cleanNumber,
      expiryDate,
      cardholderName,
      isDefault: isDefault === 'on'
    };

    if (nuevoMetodo.isDefault && usuario.paymentMethods.length > 0) {
      usuario.paymentMethods.forEach(m => m.isDefault = false);
    }

    usuario.paymentMethods.push(nuevoMetodo);
    await usuario.save();

    req.flash('exito', 'Método de pago agregado correctamente.');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al agregar método de pago:', error);
    req.flash('error', 'Hubo un error al guardar el método de pago.');
    res.redirect('/perfil/agregar-metodo-pago');
  }
});

router.get('/editar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    const usuario = await User.findById(req.user._id).lean();
    const metodo = usuario.paymentMethods[index];

    if (!metodo) {
      req.flash('error', 'Método de pago no encontrado.');
      return res.redirect('/perfil');
    }

    res.render('editarMetodoPago', {
      metodo,
      index,
      exito: req.flash('exito'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error al cargar el método de pago para editar:', error);
    req.flash('error', 'No se pudo cargar el método de pago.');
    res.redirect('/perfil');
  }
});

router.post('/editar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  const index = parseInt(req.params.index);
  const { cardType, cardNumber, expiryDate, cardholderName, isDefault } = req.body;

  try {
    const usuario = await User.findById(req.user._id);

    if (!usuario.paymentMethods || usuario.paymentMethods.length <= index) {
      req.flash('error', 'Método de pago no encontrado.');
      return res.redirect('/perfil');
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');

    usuario.paymentMethods[index] = {
      cardType,
      cardNumber: cleanNumber,
      expiryDate,
      cardholderName,
      isDefault: isDefault === 'on'
    };

    if (usuario.paymentMethods[index].isDefault) {
      usuario.paymentMethods.forEach((m, i) => {
        if (i !== index) m.isDefault = false;
      });
    }

    await usuario.save();
    req.flash('exito', 'Método de pago actualizado correctamente.');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    req.flash('error', 'No se pudo actualizar el método de pago.');
    res.redirect('/perfil');
  }
});

router.post('/eliminar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    const usuario = await User.findById(req.user._id);

    if (usuario.paymentMethods && usuario.paymentMethods.length > index) {
      usuario.paymentMethods.splice(index, 1);
      await usuario.save();
      req.flash('exito', 'Método de pago eliminado.');
    } else {
      req.flash('error', 'No se encontró el método de pago.');
    }

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    req.flash('error', 'No se pudo eliminar el método de pago.');
    res.redirect('/perfil');
  }
});

router.post('/cancelar-pedido/:id', isAuthenticated, async (req, res) => {
  const pedidoId = req.params.id;

  try {
    const pedido = await Pedido.findOne({ _id: pedidoId, usuario: req.user._id });

    if (!pedido) {
      req.flash('error', 'Pedido no encontrado.');
      return res.redirect('/perfil');
    }

    if (pedido.estado === 'pendiente') {
      pedido.estado = 'cancelado';
      await pedido.save();
      req.flash('exito', 'Pedido cancelado correctamente.');
    } else {
      req.flash('error', 'No se puede cancelar un pedido ya procesado.');
    }

    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    req.flash('error', 'No se pudo cancelar el pedido.');
    res.redirect('/perfil');
  }
});

router.get('/editar', isAuthenticated, async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).lean();
    if (!usuario) {
      req.flash('error', 'Usuario no encontrado.');
      return res.redirect('/perfil');
    }

    res.render('editarPerfil', { usuario, exito: req.flash('exito'), error: req.flash('error') });
  } catch (error) {
    console.error('Error al cargar edición de perfil:', error);
    req.flash('error', 'No se pudo cargar la edición de perfil.');
    res.redirect('/perfil');
  }
});

router.post('/editar', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  const { name, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

  try {
    const usuario = await User.findById(req.user._id);

    if (!usuario) {
      req.flash('error', 'Usuario no encontrado.');
      return res.redirect('/perfil');
    }

    usuario.name = name;
    usuario.phoneNumber = phoneNumber;

    if (req.file) {
      usuario.profilePicture = '/uploads/perfiles/' + req.file.filename;
    }

    usuario.shippingAddresses = [{
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: true
    }];

    await usuario.save();
    req.flash('exito', 'Perfil actualizado correctamente.');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al guardar edición del perfil:', error);
    req.flash('error', 'No se pudo actualizar el perfil.');
    res.redirect('/perfil/editar');
  }
});
// Mostrar formulario para editar método de pago
router.get('/editar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  const index = parseInt(req.params.index);
  try {
    const usuario = await User.findById(req.user._id).lean();
    if (!usuario || !usuario.paymentMethods[index]) {
      req.flash('error', 'Método de pago no encontrado.');
      return res.redirect('/perfil');
    }

    const metodo = usuario.paymentMethods[index];
    res.render('editarMetodoPago', { metodo, index, exito: req.flash('exito'), error: req.flash('error') });
  } catch (error) {
    console.error('Error al cargar método de pago:', error);
    req.flash('error', 'No se pudo cargar el método de pago.');
    res.redirect('/perfil');
  }
});

// Guardar cambios al editar método de pago
router.post('/editar-metodo-pago/:index', isAuthenticated, async (req, res) => {
  const index = parseInt(req.params.index);
  const { cardType, cardNumber, expiryDate, cardholderName, isDefault } = req.body;

  try {
    const usuario = await User.findById(req.user._id);

    if (!usuario || !usuario.paymentMethods[index]) {
      req.flash('error', 'Método de pago no encontrado.');
      return res.redirect('/perfil');
    }

    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.length !== 16 || !/^\d+$/.test(cleanNumber)) {
      req.flash('error', 'El número de tarjeta debe tener 16 dígitos numéricos.');
      return res.redirect(`/perfil/editar-metodo-pago/${index}`);
    }

    if (isDefault === 'on') {
      usuario.paymentMethods.forEach(m => m.isDefault = false);
    }

    usuario.paymentMethods[index] = {
      cardType,
      cardNumber: cleanNumber,
      expiryDate,
      cardholderName,
      isDefault: isDefault === 'on'
    };

    await usuario.save();
    req.flash('exito', 'Método de pago actualizado correctamente.');
    res.redirect('/perfil');
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    req.flash('error', 'No se pudo actualizar el método de pago.');
    res.redirect(`/perfil/editar-metodo-pago/${index}`);
  }
});

module.exports = router;
