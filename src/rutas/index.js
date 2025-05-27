// routes/index.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Producto');
const multer = require('multer');
const path = require('path');

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

// Ruta principal (/) - Mostrar productos en cards
router.get('/', async (req, res, next) => {
    try {
        const productos = await Producto.find().lean();
        res.render('index', { productos: productos });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

router.get('/Perfil', (req, res, next) => {
    res.render('perfil');
});

router.get('/index', (req, res, next) => {
    res.render('index');
});

router.get('/formulario', (req, res, next) => {
    res.render('formulario');
});

router.get('/Editar', async (req, res) => {
    try {
        const productos = await Producto.find().lean();
        res.render('Editar', { productos });
    } catch (err) {
        console.error(' ERROR EN LA RUTA GET /:', err);
        res.status(500).send('Error interno del servidor');
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

// Mostrar productos
router.get('/Guardar', async (req, res) => {
    try {
        const productos = await Producto.find().lean();
        res.render('Guardar', { productos });
    } catch (err) {
        console.error(' ERROR EN LA RUTA GET /:', err);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para seleccionar o mostrar el producto a editar
router.get('/Editar/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).lean();
        res.render('Editar', { producto });
    } catch (err) {
        res.status(500).send('Error al cargar el producto');
    }
});

// Editar o actualizar producto
router.post('/Editar/:id', async (req, res) => {
    try {
        await Producto.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/Guardar'); // Pagina donde se encuentra lista de productos
    } catch (err) {
        res.status(500).send('Error al actualizar el producto');
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