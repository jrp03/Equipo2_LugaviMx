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

// === Configuración de subida de imágenes ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/productos/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/\.+/g, '.');
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

/* === Dashboard === */
router.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const totalProductos = await Product.countDocuments();
    const totalPedidos = await Pedido.countDocuments();
    const totalUsuarios = await User.countDocuments();
    const productosBajoStock = await Product.find({ stock: { $lte: 3 } });

    res.render('admin/dashboard', {
      user: req.user,
      totalProductos,
      totalPedidos,
      totalUsuarios,
      productosBajoStock,
      active: 'dashboard'
    });
  } catch (error) {
    res.status(500).send('Error interno del servidor');
  }
});

/* === Exportaciones === */
router.get('/admin/pedidos/exportar-excel', isAuthenticated, isAdmin, async (req, res) => {
  const pedidos = await Pedido.find().populate('usuario');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pedidos');

  worksheet.columns = [
    { header: 'ID', key: '_id' },
    { header: 'Cliente', key: 'cliente' },
    { header: 'Fecha', key: 'fecha' },
    { header: 'Total', key: 'total' },
    { header: 'Estado', key: 'estado' },
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

  res.setHeader('Content-Disposition', 'attachment; filename=pedidos.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

router.get('/admin/pedidos/exportar-pdf', isAuthenticated, isAdmin, async (req, res) => {
  const pedidos = await Pedido.find().populate('usuario');
  const doc = new PDFDocument();

  res.setHeader('Content-Disposition', 'attachment; filename=pedidos.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);
  doc.fontSize(18).text('Reporte de Pedidos', { align: 'center' }).moveDown();

  pedidos.forEach(p => {
    doc.fontSize(12).text(`ID: ${p._id}`);
    doc.text(`Cliente: ${p.usuario?.name || 'Sin nombre'}`);
    doc.text(`Fecha: ${new Date(p.createdAt).toLocaleString()}`);
    doc.text(`Total: $${p.total}`);
    doc.text(`Estado: ${p.estado}`);
    doc.moveDown();
  });

  doc.end();
});

/* === Productos === */
router.get('/admin/productos', isAuthenticated, isAdmin, async (req, res) => {
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
    res.status(500).send('Error al guardar producto');
  }
});

router.post('/admin/productos/:id/eliminar', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.redirect('/admin/productos');
  } catch {
    res.status(500).send('Error al eliminar producto');
  }
});

router.get('/admin/productos/:id/editar', isAuthenticated, isAdmin, async (req, res) => {
  const producto = await Product.findById(req.params.id);
  if (!producto) return res.status(404).send('Producto no encontrado');
  res.render('admin/editarProducto', { producto, active: 'productos' });
});

router.post('/admin/productos/:id/editar', isAuthenticated, isAdmin, upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio, stock, categoria, subcategoria, talla, color, destacado } = req.body;
  const producto = await Product.findById(req.params.id);
  if (!producto) return res.status(404).send('Producto no encontrado');

  producto.nombre = nombre;
  producto.descripcion = descripcion;
  producto.precio = precio;
  producto.stock = stock;
  producto.categoria = categoria;
  producto.subcategoria = subcategoria || '';
  producto.tallas = talla ? [talla] : ['Unitalla'];
  producto.color = color;
  producto.destacado = destacado === 'true';

  if (req.file) producto.imagenes = ['/uploads/productos/' + req.file.filename];

  await producto.save();
  res.redirect('/admin/productos');
});

/* === Pedidos === */
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
    console.error('Error al cargar vista de pedidos:', error);
    res.render('admin/pedidos', {
      pedidos: [],
      estadoSeleccionado: 'todos',
      active: 'pedidos',
      error: 'Error al cargar pedidos.'
    });
  }
});

router.get('/admin/api/pedidos', isAuthenticated, isAdmin, async (req, res) => {
  const filtro = {};
  if (req.query.estado && req.query.estado !== 'todos') {
    filtro.estado = req.query.estado;
  }

  try {
    const pedidos = await Pedido.find(filtro).populate('usuario');
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos desde API:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

router.get('/admin/pedidos/:id', isAuthenticated, isAdmin, async (req, res) => {
  const pedido = await Pedido.findById(req.params.id)
    .populate('usuario')
    .populate('productos.producto');

  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(pedido);
});

router.post('/admin/pedidos/:id/estado', isAuthenticated, isAdmin, async (req, res) => {
  await Pedido.findByIdAndUpdate(req.params.id, { estado: req.body.estado });
  res.status(200).json({ success: true });
});

router.post('/admin/pedidos/:id/comentario', isAuthenticated, isAdmin, async (req, res) => {
  const update = {};
  if (req.body.comentario !== undefined) update.comentario = req.body.comentario;
  if (req.body.notificarCliente !== undefined) update.notificarCliente = req.body.notificarCliente;

  await Pedido.findByIdAndUpdate(req.params.id, update);
  res.status(200).json({ success: true });
});

/* === Usuarios === */
router.get('/admin/usuarios', isAuthenticated, isAdmin, async (req, res) => {
  const { estado, rol, busqueda, mensaje } = req.query;
  const filtro = {};
  let mensajeExito = '';

  if (rol) filtro.rol = rol;
  if (estado === 'activo') filtro.activo = true;
  if (estado === 'suspendido') filtro.activo = false;
  if (busqueda) {
    filtro.$or = [
      { name: { $regex: busqueda, $options: 'i' } },
      { email: { $regex: busqueda, $options: 'i' } }
    ];
  }

  if (mensaje === 'filtro') mensajeExito = '✅ Filtros aplicados correctamente';

  const usuarios = await User.find(filtro);

  res.render('admin/usuarios', {
    usuarios,
    active: 'usuarios',
    estado,
    rol,
    busqueda,
    mensajeExito
  });
});

router.post('/admin/usuarios/:id/rol', isAuthenticated, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { rol: req.body.rol });
  res.redirect('/admin/usuarios');
});

router.post('/admin/usuarios/:id/suspender', isAuthenticated, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  await User.findByIdAndUpdate(req.params.id, { activo: !user.activo });
  res.redirect('/admin/usuarios');
});

router.get('/admin/usuarios/:id/pedidos', isAuthenticated, isAdmin, async (req, res) => {
  const usuario = await User.findById(req.params.id);
  const pedidos = await Pedido.find({ usuario: req.params.id }).sort({ createdAt: -1 });
  res.render('admin/historialPedidosUsuario', { usuario, pedidos, active: 'usuarios' });
});

router.get('/admin/usuarios/:id/editar', isAuthenticated, isAdmin, async (req, res) => {
  const usuario = await User.findById(req.params.id);
  res.render('admin/editarUsuario', { usuario, active: 'usuarios' });
});

router.post('/admin/usuarios/:id/editar', isAuthenticated, isAdmin, async (req, res) => {
  const { name, email, phoneNumber } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, phoneNumber });
  res.redirect('/admin/usuarios');
});

module.exports = router;
