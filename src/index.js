const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const productoRoutes = require('./rutas');
const Carrito = require('./models/carrito'); // Importa el modelo Carrito


const app = express();
require('./database');
require('./passport/local-auth')

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', engine);


//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(flash())

app.use(session({
    secret: 'mysecretsession',
    resave: false,
    saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session());
// Middleware para la variable global cartItemCount
app.use(async (req, res, next) => {
    try {
        res.locals.cartItemCount = 0;  // Valor predeterminado
        if (req.isAuthenticated()) {
            const usuarioId = req.user.id;
            const carrito = await Carrito.findOne({ usuario: usuarioId });
            if (carrito) {
                res.locals.cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0); // Calcula la cantidad total
            }
        }
        next(); // Llama a next() para pasar al siguiente middleware o ruta
    } catch (error) {
        console.error("Error en el middleware viewVariables:", error);
        next(error); // Pasa el error al siguiente middleware de manejo de errores
    }
});
app.use((req, res, next)=>{
    app.locals.mensajeRegistro = req.flash('mensajeRegistro')
    app.locals.mensajeLogin = req.flash('mensajeLogin')
    app.locals.user = req.user;    
    next();
})

app.use('/', require('./rutas'));
app.use('/formulario', productoRoutes);

//iniciando el servidor
app.use((err, req, res, next) => {
    console.error(err.stack)
      res.status(500).send('Something broke!')
    })
app.listen(app.get('port'), () =>{
    console.log('Servidor iniciado en el puerto', app.get('port'));
});