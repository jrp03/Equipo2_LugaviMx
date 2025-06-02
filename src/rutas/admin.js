const express = require('express');
const router = express.Router();
const Product = require('../models/producto');
const Pedido = require('../models/order');
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Dashboard principal
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const totalProductos = await Product.countDocuments();
    const totalPedidos = await Pedido.countDocuments();
    const totalUsuarios = await User.countDocuments();

    res.render('admin/dashboard', {
      user: req.user,
      totalProductos,
      totalPedidos,
      totalUsuarios,
      active: 'dashboard'
    });
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Vista de productos
router.get('/admin/productos', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const productos = await Product.find();
    res.render('admin/productos', { productos, active: 'productos' });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar productos');
  }
});

// Crear producto
router.post('/admin/productos', isAuthenticated, isAdmin, async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria } = req.body;
  try {
    await Product.create({ nombre, descripcion, precio, stock, categoria });
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('No se pudo crear el producto');
  }
});

// Eliminar producto
router.post('/admin/productos/:id/eliminar', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('No se pudo eliminar el producto');
  }
});

// Vista de pedidos
router.get('/admin/pedidos', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('usuario');
    res.render('admin/pedidos', { pedidos, active: 'pedidos' });
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    res.status(500).send('Error al cargar pedidos');
  }
});

// Cambiar estado del pedido
router.post('/admin/pedidos/:id/estado', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    await Pedido.findByIdAndUpdate(req.params.id, { estado });
    res.redirect('/admin/pedidos');
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).send('No se pudo actualizar el estado del pedido');
  }
});

// Vista de usuarios
router.get('/admin/usuarios', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find(); // asegúrate de importar bien el modelo
    res.render('admin/usuarios', { usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Cambiar rol de usuario
router.post('/admin/usuarios/:id/role', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al actualizar role:', error);
    res.status(500).send('No se pudo cambiar el role');
  }
});
// CORREGIR campo 'rol' a 'role'
router.post('/admin/fix-roles', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const usuariosConRol = await User.find({ rol: { $exists: true } });

    for (const usuario of usuariosConRol) {
      await User.updateOne(
        { _id: usuario._id },
        {
          $set: { role: usuario.rol },
          $unset: { rol: "" }
        }
      );
    }

    res.status(200).send(`Se actualizaron ${usuariosConRol.length} usuarios con campo 'rol' → 'role'.`);
  } catch (error) {
    console.error('Error al corregir roles:', error);
    res.status(500).send('Error al corregir los roles');
  }
});

module.exports = router;