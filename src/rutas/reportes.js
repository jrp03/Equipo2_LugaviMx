const express = require('express');
const router = express.Router();
const Pedido = require('../models/order');
const Producto = require('../models/producto');
const User = require('../models/user');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

router.get('/admin/reportes', async (req, res) => {
  try {
    const { inicio, fin, exportado } = req.query;
    const filter = {};
    let mensajeExito = '';

    if (inicio && fin) {
      filter.createdAt = {
        $gte: new Date(inicio + 'T00:00:00'),
        $lte: new Date(fin + 'T23:59:59')
      };
    }

    if (exportado === 'excel') mensajeExito = '📥 Reporte Excel generado con éxito';
    if (exportado === 'pdf') mensajeExito = '📄 Reporte PDF generado con éxito';
    if (!exportado && (inicio || fin)) mensajeExito = '✅ Filtros aplicados correctamente';

    const pedidos = await Pedido.find(filter).populate('usuario');
    const productos = await Producto.find();
    const usuarios = await User.find();

    if (pedidos.length === 0) {
      mensajeExito = '⚠️ No se encontraron pedidos en el rango seleccionado';
    }

    const ventasPorMes = {};
    const productosVendidos = {};
    const estadosPedidos = {};
    const pedidosPorUsuario = {};

    pedidos.forEach(pedido => {
      const fecha = pedido.createdAt || pedido.fechaPedido;
      const mes = new Date(fecha).toLocaleString('default', { month: 'short', year: 'numeric' });
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + pedido.total;

      estadosPedidos[pedido.estado] = (estadosPedidos[pedido.estado] || 0) + 1;

      if (pedido.usuario && pedido.usuario.name) {
        const nombre = pedido.usuario.name;
        pedidosPorUsuario[nombre] = (pedidosPorUsuario[nombre] || 0) + 1;
      }

      pedido.productos.forEach(p => {
        const id = p.producto.toString();
        productosVendidos[id] = (productosVendidos[id] || 0) + p.cantidad;
      });
    });

    const productosNombres = [];
    const productosCantidades = [];

    for (const [productoId, cantidad] of Object.entries(productosVendidos)) {
      const producto = productos.find(p => p._id.toString() === productoId);
      if (producto) {
        productosNombres.push(producto.nombre);
        productosCantidades.push(cantidad);
      }
    }

    const nombresUsuariosActivos = Object.keys(pedidosPorUsuario);
    const cantidadPedidosPorUsuario = Object.values(pedidosPorUsuario);

    const meses = Object.keys(ventasPorMes);
    const ventasTotales = Object.values(ventasPorMes);
    const estados = Object.keys(estadosPedidos);
    const cantidadesPorEstado = Object.values(estadosPedidos);

    res.render('admin/reportes', {
      user: req.user,
      meses,
      ventasTotales,
      productosNombres,
      productosCantidades,
      estados,
      cantidadesPorEstado,
      nombresUsuariosActivos,
      cantidadPedidosPorUsuario,
      inicio,
      fin,
      mensajeExito,
      active: 'reportes'
    });
  } catch (err) {
    console.error('Error generando reportes:', err);
    res.status(500).send('Error al generar el reporte');
  }
});

router.get('/admin/reportes/exportar-excel', async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    const filter = {};

    if (inicio && fin) {
      filter.createdAt = {
        $gte: new Date(inicio + 'T00:00:00'),
        $lte: new Date(fin + 'T23:59:59')
      };
    }

    const pedidos = await Pedido.find(filter).populate('usuario');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedidos');

    sheet.columns = [
      { header: 'ID', key: '_id', width: 25 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Fecha', key: 'fecha', width: 25 },
      { header: 'Total ($)', key: 'total', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];

    pedidos.forEach(p => {
      sheet.addRow({
        _id: p._id.toString(),
        cliente: p.usuario?.name || 'Sin nombre',
        fecha: new Date(p.createdAt).toLocaleString(),
        total: p.total,
        estado: p.estado || 'N/A'
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes_pedidos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Error al generar Excel:', err);
    res.status(500).send('No se pudo exportar el Excel');
  }
});

router.get('/admin/reportes/exportar-pdf', async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    const filter = {};

    if (inicio && fin) {
      filter.createdAt = {
        $gte: new Date(inicio + 'T00:00:00'),
        $lte: new Date(fin + 'T23:59:59')
      };
    }

    const pedidos = await Pedido.find(filter).populate('usuario');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes_pedidos.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('Reporte de Pedidos', { align: 'center' });
    doc.moveDown();

    pedidos.forEach(p => {
      doc.fontSize(12).text(`ID: ${p._id}`);
      doc.text(`Cliente: ${p.usuario?.name || 'Sin nombre'}`);
      doc.text(`Fecha: ${new Date(p.createdAt).toLocaleString()}`);
      doc.text(`Total: $${p.total}`);
      doc.text(`Estado: ${p.estado || 'N/A'}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('❌ Error al generar PDF:', err);
    res.status(500).send('No se pudo exportar el PDF');
  }
});

module.exports = router;
