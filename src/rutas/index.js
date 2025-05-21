const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Producto');




router.get('/registro', (req, res, next) =>{
    res.render('registro')
})
router.get('/Login', (req, res, next) =>{
    res.render('login')
})
router.get('/index', (req, res, next) =>{
    res.render('index')
})

router.get('/index', (req, res, next) =>{
    res.render('index')
})

router.get('/formulario', (req, res, next) =>{
    res.render('formulario')
})
router.get('/Editar', async (req, res) => {
  try {
    const productos = await Producto.find().lean(); 
    res.render('Editar', { productos });
  } catch (err) {
    console.error(' ERROR EN LA RUTA GET /:', err);
    res.status(500).send('Error interno del servidor');
  }
});


router.get('/Salir', (req, res, next) =>{
    req.logOut((err) =>{
        if(err) return next(err);
        res.redirect('/')
    })
})


router.post('/registro', passport.authenticate('registro-local',{
    successRedirect: '/Perfil',
    failureRedirect: '/registro',
    passReqToCallback: true
}))

router.post('/Login', passport.authenticate('inicio-local',{
    successRedirect: '/Perfil',
    failureRedirect: '/Login',
    passReqToCallback: true
}))

// Guardar producto
router.post('/formulario', async (req, res) => {
    const producto = Producto(req.body);
    await producto.save() // Guardar en la base de datos
    res.redirect('/formulario');
})

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
})

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
})

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;