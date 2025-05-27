const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Producto');
const multer = require('multer');
const path = require('path');
const Carrito = require('../models/carrito'); // Importa el modelo de Carrito

// Configuración del almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = path.join(__dirname, '../public/uploads/');
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/registro', (req, res, next) => {
    res.render('registro');
});

router.get('/Login', (req, res, next) => {
    res.render('login');
});

router.post('/carrito/agregar', isAuthenticated, async (req, res) => {
  try {
    const usuarioId = req.user.id; // Obtén el ID del usuario autenticado
    const productoId = req.body.productoId;
    const cantidad = parseInt(req.body.cantidad) || 1;

    // Verifica que la cantidad sea válida
    if (isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).send('Cantidad inválida');
    }

    // Busca el carrito del usuario
    let carrito = await Carrito.findOne({ usuario: usuarioId });

    // Si no existe, crea un nuevo carrito
    if (!carrito) {
      carrito = new Carrito({ usuario: usuarioId, productos: [] });
    }

    // Busca si el producto ya está en el carrito
    let existingItem = carrito.productos.find(item => item.producto == productoId);

    if (existingItem) {
      existingItem.cantidad += cantidad; // Suma la cantidad
    } else {
      carrito.productos.push({ producto: productoId, cantidad: cantidad }); // Agrega un nuevo item
    }

    await carrito.save();
    // Calcula la cantidad total de productos en el carrito
     let cartItemCount = 0;

    if (req.isAuthenticated()) {
     
      if (carrito) {
        cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
      }
    }

    // Envía la cantidad actualizada al frontend
    res.status(200).json({cartItemCount:cartItemCount});
  } catch (error) {
    console.error('Error al añadir al carrito:', error);
    res.status(500).send('Error al añadir al carrito');
  }
});
// Ruta para obtener el carrito de un usuario
router.get('/carrito', isAuthenticated, async (req, res) => {
  try {
    const usuarioId = req.user.id; // Obtén el ID del usuario autenticado
    const carrito = await Carrito.findOne({ usuario: usuarioId }).populate('productos.producto'); // Carga los detalles del producto

    if (!carrito) {
      return res.render('carrito', { productos: [], total: 0 }); // Renderiza con un carrito vacío
    }

    // Calcula el total del carrito
    let total = 0;
    carrito.productos.forEach(item => {
      total += item.producto.precio * item.cantidad;
    });

    res.render('carrito', { productos: carrito.productos, total: total.toFixed(2) }); // Renderiza la vista con los productos y el total
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});


// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/Login'); // Redirige a la página de inicio de sesión si no está autenticado
}

// Ruta principal (/) - Mostrar productos en cards
router.get('/', async (req, res, next) => {
  try {
    const productos = await Producto.find().lean();
    let cartItemCount = 0;

    if (req.isAuthenticated()) {
      const usuarioId = req.user.id;
      const carrito = await Carrito.findOne({ usuario: usuarioId });
      if (carrito) {
        cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
      }
    }

    res.render('index', { productos: productos, cartItemCount: cartItemCount });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});

router.get('/Perfil',async (req, res, next) => {
 try {
        let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
    res.render('perfil', {cartItemCount});
  } catch (error) {
    console.error('Error al cargar el producto', error);
        res.status(500).send('error al obtener los productos');
    }
});

router.get('/index', async (req, res, next) => {
 try {
        let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
    res.render('index', {cartItemCount});
  } catch (error) {
    console.error('Error al cargar el producto', error);
        res.status(500).send('error al obtener los productos');
    }
});

router.get('/formulario', async (req, res, next) => {
 try {
        let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
    res.render('formulario', {cartItemCount});
  } catch (error) {
    console.error('Error al cargar el producto', error);
        res.status(500).send('error al obtener los productos');
    }
});

router.get('/Editar', async (req, res) => {
    try {
        const productos = await Producto.find().lean();
                let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
        res.render('Editar', { productos, cartItemCount });
    } catch (err) {
        console.error(' ERROR EN LA RUTA GET /:', err);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/Guardar', async (req, res) => {
    try {
                let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
        const productos = await Producto.find().lean();
        res.render('Guardar', { productos, cartItemCount });
    } catch (err) {
        console.error(' ERROR EN LA RUTA GET /:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para seleccionar o mostrar el producto a editar
router.get('/Editar/:id', async (req, res) => {
    try {
                let cartItemCount = 0;
    if (req.isAuthenticated()) {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId });
        if (carrito) {
          cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
        }
    }
        const producto = await Producto.findById(req.params.id).lean();
        res.render('Editar', { producto ,cartItemCount});
    } catch (err) {
        res.status(500).send('Error al cargar el producto');
    }
});

router.get('/Salir', (req, res, next) => {
    req.logOut((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.post('/registro', passport.authenticate('registro-local', {
    successRedirect: '/Perfil',
    failureRedirect: '/registro',
    passReqToCallback: true
}));

router.post('/Login', passport.authenticate('inicio-local', {
    successRedirect: '/Perfil',
    failureRedirect: '/Login',
    passReqToCallback: true
}));

// Guardar producto (con Multer para la carga de imágenes)
router.post('/formulario', upload.array('imagen', 10), async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, color, tallas } = req.body;

        // Manejo de tallas
        let tallasArray = req.body.tallas;
        if (typeof tallasArray === 'string') {
            tallasArray = [tallasArray]; // Convierte a array si solo se seleccionó una talla
        } else if (!tallasArray) {
            tallasArray = []; // Si no se seleccionaron tallas, asigna un array vacío
        }

        const imagenes = req.files.map(file => '/uploads/' + file.filename);

        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoria,
            color,
            tallas: tallasArray,
            imagenes,
        });

        await nuevoProducto.save();
        res.redirect('/Guardar'); // Redirige a la página donde se muestran los productos guardados
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        res.status(500).send('Error al guardar el producto');
    }
});



// Eliminar producto
router.get('/Eliminar/:id', async (req, res) => {
    const { id } = req.params;
    await Producto.findByIdAndDelete(id);
    res.redirect('/Guardar'); // Pagina donde se encuentra lista de productos
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = router;