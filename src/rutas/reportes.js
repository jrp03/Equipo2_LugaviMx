const express = require('express');
const router = express.Router();
const Pedido = require('../models/order');
const Producto = require('../models/producto');

// Ruta: /admin/reportes
router.get('/admin/reportes', async (req, res) => {
  try {
    // Obtener datos para gráficas
    const pedidos = await Pedido.find({});
    const productos = await Producto.find({});

    // Agrupar por mes
    const ventasPorMes = {};
    const productosVendidos = {};

    pedidos.forEach(pedido => {
      const mes = pedido.fechaPedido.toLocaleString('default', { month: 'short', year: 'numeric' });
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + pedido.total;

      pedido.productos.forEach(p => {
        const id = p.producto.toString();
        productosVendidos[id] = (productosVendidos[id] || 0) + p.cantidad;
      });
    });

    // Traducir IDs a nombres
    const productosNombres = [];
    const productosCantidades = [];

    for (const [productoId, cantidad] of Object.entries(productosVendidos)) {
      const producto = productos.find(p => p._id.toString() === productoId);
      if (producto) {
        productosNombres.push(producto.nombre);
        productosCantidades.push(cantidad);
      }
    }

    const meses = Object.keys(ventasPorMes);
    const ventasTotales = Object.values(ventasPorMes);

    const express = require('express');
const router = express.Router();
const Pedido = require('../models/order');
const Producto = require('../models/producto');

// Ruta: /admin/reportes
router.get('/admin/reportes', async (req, res) => {
  try {
    // Obtener datos para gráficas
    const pedidos = await Pedido.find({});
    const productos = await Producto.find({});

    // Agrupar por mes
    const ventasPorMes = {};
    const productosVendidos = {};

    pedidos.forEach(pedido => {
      const mes = pedido.fechaPedido.toLocaleString('default', { month: 'short', year: 'numeric' });
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + pedido.total;

      pedido.productos.forEach(p => {
        const id = p.producto.toString();
        productosVendidos[id] = (productosVendidos[id] || 0) + p.cantidad;
      });
    });

    // Traducir IDs a nombres
    const productosNombres = [];
    const productosCantidades = [];

    for (const [productoId, cantidad] of Object.entries(productosVendidos)) {
      const producto = productos.find(p => p._id.toString() === productoId);
      if (producto) {
        productosNombres.push(producto.nombre);
        productosCantidades.push(cantidad);
      }
    }

    const meses = Object.keys(ventasPorMes);
    const ventasTotales = Object.values(ventasPorMes);

    res.render('admin/reportes', {
      meses,
      ventasTotales,
      productosNombres,
      productosCantidades
    });
  } catch (err) {
    console.error('Error generando reportes:', err);
    res.status(500).send('Error al generar el reporte');
  }
});
    
  } catch (err) {
    console.error('Error generando reportes:', err);
    res.status(500).send('Error al generar el reporte');
  }
});

module.exports = router;
