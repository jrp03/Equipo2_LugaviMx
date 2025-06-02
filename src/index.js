const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const productoRoutes = require('./rutas');
const adminRoutes = require('./rutas/admin'); // ✅ Nuevo
const Carrito = require('./models/carrito');
const engine = require('ejs-mate');
const app = express();
require('./database');
require('./passport/local-auth');

app.set('port', process.env.PORT || 3001);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(session({
    secret: 'mysecretsession',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware para mostrar la cantidad de productos en el carrito
app.use(async (req, res, next) => {
    try {
        res.locals.cartItemCount = 0;
        if (req.isAuthenticated()) {
            const carrito = await Carrito.findOne({ usuario: req.user.id });
            if (carrito) {
                res.locals.cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0);
            }
        }
        next();
    } catch (error) {
        console.error("Error en middleware carrito:", error);
        next(error);
    }
});

// Flash y user global
app.use((req, res, next) => {
    app.locals.mensajeRegistro = req.flash('mensajeRegistro');
    app.locals.mensajeLogin = req.flash('mensajeLogin');
    app.locals.user = req.user;
    next();
});

// Rutas
app.use('/', productoRoutes);
app.use('/', adminRoutes); // ✅ rutas del panel admin
app.use('/', require('./rutas/reportes'));

// Página 404
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log('Servidor iniciado en el puerto', app.get('port'));
});
