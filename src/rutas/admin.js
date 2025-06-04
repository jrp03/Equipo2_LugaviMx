const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Product = require('../models/producto');
const Pedido = require('../models/order');
const User = require('../models/user');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Configuración de subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/productos/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/\.+/g, '.');
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

/* === Dashboard principal === */
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

/* === Gestión de Productos === */
router.get('/admin/productos', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { busqueda, categoria } = req.query;
    const query = {};
    if (busqueda) query.nombre = { $regex: busqueda, $options: 'i' };
    if (categoria) query.categoria = categoria;

    const productos = await Product.find(query);
    const categoriasUnicas = await Product.distinct('categoria');

    res.render('admin/productos', {
      productos,
      categoriasUnicas,
      busqueda,
      categoria,
      active: 'productos'
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al filtrar productos');
  }
});

router.get('/admin/productos/nuevo', isAuthenticated, isAdmin, (req, res) => {
  res.render('admin/nuevoProducto', { active: 'productos' });
});

router.post('/admin/productos/nuevo', isAuthenticated, isAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, subcategoria, talla, color, destacado } = req.body;
    const imagenRuta = req.file ? '/uploads/productos/' + req.file.filename : null;

    if (!imagenRuta) return res.status(400).send('Debes subir al menos una imagen');

    const nuevoProducto = new Product({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      subcategoria: subcategoria || '',
      tallas: talla ? [talla] : ['Unitalla'],
      color: color || 'No especificado',
      imagenes: [imagenRuta],
      destacado: destacado === 'true',
      envioGratis: false
    });

    await nuevoProducto.save();
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al guardar producto:', error);
    res.status(500).send('Error interno al guardar el producto');
  }
});

router.post('/admin/productos/:id/eliminar', isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('No se pudo eliminar el producto');
  }
});

router.get('/admin/productos/:id/editar', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.render('admin/editarProducto', { producto, active: 'productos' });
  } catch (error) {
    console.error('Error al cargar producto:', error);
    res.status(500).send('Error interno');
  }
});

router.post('/admin/productos/:id/editar', isAuthenticated, isAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, subcategoria, talla, color, destacado, envioGratis } = req.body;
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');

    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.categoria = categoria;
    producto.subcategoria = subcategoria || '';
    producto.precio = precio;
    producto.stock = stock;
    producto.tallas = talla ? [talla] : ['Unitalla'];
    producto.color = color;
    producto.destacado = destacado === 'true';

    if (req.file) {
      const nuevaImagen = '/uploads/' + req.file.filename;
      producto.imagenes = [nuevaImagen];
    }

    await producto.save();
    res.redirect('/admin/productos');
  } catch (error) {
    console.error('Error al editar producto:', error);
    res.status(500).send('No se pudo actualizar el producto');
  }
});

/* === Gestión de Pedidos === */

// Exportar pedidos a Excel
router.get('/admin/pedidos/exportar-excel', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado && req.query.estado !== 'todos') filtro.estado = req.query.estado;

    const pedidos = await Pedido.find(filtro).populate('usuario');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedidos');

    worksheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 25 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];

    pedidos.forEach(p => {
      worksheet.addRow({
        _id: p._id.toString(),
        cliente: p.usuario?.name || 'Sin nombre',
        fecha: new Date(p.createdAt).toLocaleString(),
        total: p.total,
        estado: p.estado
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos_filtrados.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al generar Excel:', error);
    res.status(500).send('Error al generar Excel');
  }
});

// Exportar pedidos a PDF
router.get('/admin/pedidos/exportar-pdf', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado && req.query.estado !== 'todos') filtro.estado = req.query.estado;

    const pedidos = await Pedido.find(filtro).populate('usuario');

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=pedidos_filtrados.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(20).text('Reporte de Pedidos', { align: 'center' });
    doc.moveDown();

    pedidos.forEach(p => {
      doc.fontSize(12).text(`ID: ${p._id}`);
      doc.text(`Cliente: ${p.usuario?.name || 'Sin nombre'}`);
      doc.text(`Fecha: ${new Date(p.createdAt).toLocaleString()}`);
      doc.text(`Total: $${p.total}`);
      doc.text(`Estado: ${p.estado}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF');
  }
});

// Vista HTML de pedidos
router.get('/admin/pedidos', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado && req.query.estado !== 'todos') filtro.estado = req.query.estado;

    const pedidos = await Pedido.find(filtro).populate('usuario');
    res.render('admin/pedidos', {
      pedidos,
      estadoSeleccionado: req.query.estado || 'todos',
      active: 'pedidos'
    });
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).send('Error al obtener los pedidos');
  }
});

// API JSON para pedidos (usado por fetch)
router.get('/admin/api/pedidos', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const filtro = {};
    if (req.query.estado && req.query.estado !== 'todos') filtro.estado = req.query.estado;

    const pedidos = await Pedido.find(filtro).populate('usuario');
    res.json(pedidos);
  } catch (error) {
    console.error('❌ Error al filtrar pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Obtener un pedido por ID para mostrar en modal
router.get('/admin/pedidos/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario')
      .populate('productos.producto');

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    res.json(pedido); // ✅ Ahora sí es JSON para el fetch
  } catch (err) {
    console.error('Error al obtener detalles del pedido:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Cambiar estado de un pedido
router.post('/admin/pedidos/:id/estado', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    await Pedido.findByIdAndUpdate(req.params.id, { estado });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

router.post('/admin/pedidos/:id/comentario', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const update = {};

    // Verifica qué campo se recibió y lo agrega al objeto de actualización
    if (typeof req.body.comentario !== 'undefined') {
      update.comentario = req.body.comentario;
    }

    if (typeof req.body.notificarCliente !== 'undefined') {
      update.notificarCliente = req.body.notificarCliente;
    }

    // Aplica la actualización
    await Pedido.findByIdAndUpdate(req.params.id, update);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error al actualizar comentario o notificación:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

/* === Gestión de Usuarios === */
router.get('/admin/usuarios', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find();
    res.render('admin/usuarios', { usuarios, active: 'usuarios' });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/admin/usuarios/:id/rol', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    await User.findByIdAndUpdate(req.params.id, { rol });
    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).send('No se pudo cambiar el rol');
  }
});

router.post('/admin/fix-rol', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const usuariosConRole = await User.find({ role: { $exists: true } });
    for (const usuario of usuariosConRole) {
      await User.updateOne({ _id: usuario._id }, {
        $set: { rol: usuario.role },
        $unset: { role: "" }
      });
    }
    res.status(200).send(`Se actualizaron ${usuariosConRole.length} usuarios con campo 'role' → 'rol'.`);
  } catch (error) {
    console.error('Error al corregir roles:', error);
    res.status(500).send('Error al corregir los roles');
  }
});

module.exports = router;
