const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Producto');
const multer = require('multer');
const path = require('path');
const Carrito = require('../models/carrito');
const Pedido = require('../models/order');
const User = require('../models/user');
const carritoRoutes = require('./carrito');
const perfilRoutes = require('./perfil');

// Configuración de almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/Login');
}

// Rutas de vistas básicas
router.get('/registro', (req, res) => res.render('registro', { layout: 'layout/layout.ejs' }));
router.get('/Login', (req, res) => res.render('login', { layout: 'layout/layout.ejs' }));
router.get('/Salir', (req, res, next) => {
  req.logOut(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Página principal con productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    let cartItemCount = 0;

    if (req.isAuthenticated()) {
      const carrito = await Carrito.findOne({ usuario: req.user.id });
      if (carrito) cartItemCount = carrito.productos.reduce((t, i) => t + i.cantidad, 0);
    }

    res.render('index', { productos, cartItemCount, layout: 'layout/layout.ejs' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar productos');
  }
});

// Perfil
router.get('/Perfil', async (req, res) => {
  try {
    let cartItemCount = 0;
    let usuario = null;

    if (req.isAuthenticated()) {
      usuario = await User.findById(req.user.id).lean();
      const carrito = await Carrito.findOne({ usuario: req.user.id });
      if (carrito) cartItemCount = carrito.productos.reduce((t, i) => t + i.cantidad, 0);
    }

    res.render('perfil', { cartItemCount, usuario });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener perfil');
  }
});

// Registro con Passport
router.post('/registro', (req, res, next) => {
  passport.authenticate('registro-local', async (err, user) => {
    if (err || !user) return res.redirect('/registro');

    try {
      user.name = req.body.name;
      user.phoneNumber = req.body.phoneNumber;
      await user.save();
      req.logIn(user, err => {
        if (err) return next(err);
        return res.redirect('/Perfil');
      });
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      return res.status(500).send('Error al guardar');
    }
  })(req, res, next);
});

// Login con redirección según rol
router.post('/Login', (req, res, next) => {
  passport.authenticate('inicio-local', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/Login');

    req.logIn(user, err => {
      if (err) return next(err);
      if (user.rol === 'admin') {
        return res.redirect('/admin');
      } else {
        return res.redirect('/Perfil');
      }
    });
  })(req, res, next);
});

// Guardar nuevo producto
router.post('/formulario', upload.array('imagen', 10), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, color } = req.body;
    let tallas = Array.isArray(req.body.tallas) ? req.body.tallas : [req.body.tallas];
    const imagenes = req.files.map(file => '/uploads/' + file.filename);

    const nuevo = new Producto({ nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock), categoria, color, tallas, imagenes });
    await nuevo.save();
    res.redirect('/Guardar');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar producto');
  }
});

// Editar producto
router.get('/Editar', async (req, res) => {
  try {
    const productos = await Producto.find().lean();
    let cartItemCount = 0;

    if (req.isAuthenticated()) {
      const carrito = await Carrito.findOne({ usuario: req.user.id });
      if (carrito) cartItemCount = carrito.productos.reduce((t, i) => t + i.cantidad, 0);
    }

    res.render('Editar', { productos, cartItemCount, layout: 'layout/layout.ejs' });
  } catch (err) {
    res.status(500).send('Error en edición');
  }
});

router.get('/Editar/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).lean();
    res.render('Editar', { producto, layout: 'layout/layout.ejs' });
  } catch (err) {
    res.status(500).send('Error al cargar producto');
  }
});

// Eliminar producto
router.get('/Eliminar/:id', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.redirect('/Guardar');
});

// Página de confirmación de compra
router.get('/compra-exitosa/:id', isAuthenticated, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario')
      .populate('productos.producto');

    if (!pedido) return res.status(404).send('Pedido no encontrado');
    if (!pedido.direccionEnvio) {
      pedido.direccionEnvio = {
        addressLine1: 'Dirección no disponible',
        city: 'Ciudad no disponible',
        state: 'Estado no disponible',
        postalCode: 'CP no disponible',
        country: 'País no disponible'
      };
    }

    res.render('compra-exitosa', { pedido, usuario: req.user, layout: 'layout/layout.ejs' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar pedido');
  }
});

// Otras vistas
router.get('/Guardar', async (req, res) => {
  const productos = await Producto.find().lean();
  res.render('Guardar', { productos, layout: 'layout/layout.ejs' });
});

router.get('/formulario', (req, res) => {
  res.render('formulario', { layout: 'layout/layout.ejs' });
});

// Rutas externas
router.use('/carrito', carritoRoutes);
router.use('/perfil', perfilRoutes);

module.exports = router;

