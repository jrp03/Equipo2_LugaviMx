const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Producto');
const multer = require('multer');
const path = require('path');
const Carrito = require('../models/carrito');
const Pedido = require('../models/order'); // Importa el modelo Pedido
const carritoRoutes = require('./carrito'); // Importa las rutas del carrito

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
    res.render('registro', {layout: 'layout/layout.ejs'});
});

router.get('/Login', (req, res, next) => {
    res.render('login', {layout: 'layout/layout.ejs'});
});

// Monta las rutas del carrito en /carrito
router.use('/carrito', carritoRoutes);

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

        res.render('index', { productos: productos, cartItemCount: cartItemCount, layout: 'layout/layout.ejs' });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

router.get('/Perfil', async (req, res, next) => {
    try {
        let cartItemCount = 0;
        if (req.isAuthenticated()) {
            const usuarioId = req.user.id;
            const carrito = await Carrito.findOne({ usuario: usuarioId });
            if (carrito) {
                cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
            }
        }
        res.render('perfil', { cartItemCount, layout: 'layout/layout.ejs' });
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
        res.render('index', { cartItemCount, layout: 'layout/layout.ejs' });
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
        res.render('formulario', { cartItemCount, layout: 'layout/layout.ejs' });
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
        res.render('Editar', { productos, cartItemCount, layout: 'layout/layout.ejs' });
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
        res.render('Guardar', { productos, cartItemCount, layout: 'layout/layout.ejs' });
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
        res.render('Editar', { producto, cartItemCount, layout: 'layout/layout.ejs' });
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

// Modifica la ruta /registro para guardar los datos adicionales
router.post('/registro', async (req, res, next) => {
    passport.authenticate('registro-local', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Autenticación fallida, redirige a la página de registro con el mensaje de error
            return res.redirect('/registro');
        }

        // Si la autenticación tiene éxito, actualiza la información del usuario
        try {
            // Actualiza la información del usuario
            user.name = req.body.name;
            user.phoneNumber = req.body.phoneNumber;
            await user.save();

            // Inicia sesión al usuario
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                // Redirige al usuario a la página de perfil
                return res.redirect('/Perfil');
            });
        } catch (error) {
            console.error('Error al actualizar la información del usuario:', error);
            return res.status(500).send('Error al actualizar la información del usuario');
        }
    })(req, res, next);
});

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

// Ruta para mostrar la página de compra exitosa
// Ruta para mostrar la página de compra exitosa
router.get('/compra-exitosa/:id', isAuthenticated, async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const pedido = await Pedido.findById(pedidoId).populate('usuario').populate('productos.producto');

        if (!pedido) {
            return res.status(404).send('Pedido no encontrado');
        }

        // Verifica si la dirección está presente
        if (!pedido.direccionEnvio) {
            console.warn('Advertencia: La dirección del pedido está ausente.');
            pedido.direccionEnvio = {
                addressLine1: 'Dirección no disponible',
                city: 'Ciudad no disponible',
                state: 'Estado no disponible',
                postalCode: 'Código Postal no disponible',
                country: 'País no disponible'
            };
        }

        console.log("Pedido:", JSON.stringify(pedido, null, 2)); // Agrega esto

        res.render('compra-exitosa', {
            pedido: pedido,
            usuario: req.user,
            layout: 'layout/layout.ejs'
        });

    } catch (error) {
        console.error('Error al obtener los detalles del pedido:', error);
        res.status(500).send('Error al obtener los detalles del pedido');
    }
});
module.exports = router;