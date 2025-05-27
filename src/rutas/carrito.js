const express = require('express');
const router = express.Router();
const Carrito = require('../models/carrito');
const User = require('../models/user');
const Pedido = require('../models/order'); // Importa el modelo Pedido

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/Login');
}

router.post('/agregar', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const productoId = req.body.productoId;
        const cantidad = parseInt(req.body.cantidad) || 1;

        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).send('Cantidad inválida');
        }

        let carrito = await Carrito.findOne({ usuario: usuarioId });

        if (!carrito) {
            carrito = new Carrito({ usuario: usuarioId, productos: [] });
        }

        let existingItem = carrito.productos.find(item => item.producto == productoId);

        if (existingItem) {
            existingItem.cantidad += cantidad;
        } else {
            carrito.productos.push({ producto: productoId, cantidad: cantidad });
        }

        await carrito.save();
        let cartItemCount = 0;

        if (req.isAuthenticated()) {
            if (carrito) {
                cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0);
            }
        }

        res.status(200).json({ cartItemCount: cartItemCount });
    } catch (error) {
        console.error('Error al añadir al carrito:', error);
        res.status(500).send('Error al añadir al carrito');
    }
});

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId }).populate('productos.producto');

        if (!carrito) {
            return res.render('carrito', { productos: [], total: 0, layout: 'layout/layout.ejs' });
        }

        let total = 0;
        carrito.productos.forEach(item => {
            total += item.producto.precio * item.cantidad;
        });

        res.render('carrito', { productos: carrito.productos, total: total.toFixed(2), layout: 'layout/layout.ejs' });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

router.post('/eliminar/:productoId', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const productoId = req.params.productoId;

        let carrito = await Carrito.findOne({ usuario: usuarioId });

        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        carrito.productos = carrito.productos.filter(item => item.producto != productoId);

        await carrito.save();

        let cartItemCount = 0;
        if (carrito) {
            cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0);
        }

        res.status(200).json({ message: 'Producto eliminado del carrito', cartItemCount: cartItemCount });
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error);
        res.status(500).send('Error al eliminar el producto del carrito');
    }
});

router.post('/actualizar/:productoId', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const productoId = req.params.productoId;
        const cantidad = parseInt(req.body.cantidad);

        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).send('Cantidad inválida');
        }

        let carrito = await Carrito.findOne({ usuario: usuarioId });

        if (!carrito) {
            return res.status(404).send('Carrito no encontrado');
        }

        let existingItem = carrito.productos.find(item => item.producto == productoId);

        if (existingItem) {
            existingItem.cantidad = cantidad;
        } else {
            return res.status(404).send('Producto no encontrado en el carrito');
        }

        await carrito.save();
        let cartItemCount = 0;
        if (carrito) {
            cartItemCount = carrito.productos.reduce((total, item) => total + item.cantidad, 0);
        }

        res.status(200).json({ message: 'Cantidad del producto actualizada', cartItemCount: cartItemCount });
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto:', error);
        res.status(500).send('Error al actualizar la cantidad del producto');
    }
});

router.get('/checkout', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const carrito = await Carrito.findOne({ usuario: usuarioId }).populate('productos.producto');
        const user = await User.findById(usuarioId).populate('shippingAddresses');

        if (!carrito) {
            return res.redirect('/carrito');
        }

        let total = 0;
        carrito.productos.forEach(item => {
            total += item.producto.precio * item.cantidad;
        });

        res.render('checkout', { productos: carrito.productos, total: total.toFixed(2), user: user, layout: 'layout/layout.ejs' });
    } catch (error) {
        console.error('Error al obtener el carrito para el checkout:', error);
        res.status(500).send('Error al obtener el carrito para el checkout');
    }
});

router.post('/guardar-direccion', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { direccion, ciudad, estado, codigoPostal, pais } = req.body;

        const nuevaDireccion = {
            addressLine1: direccion,
            city: ciudad,
            state: estado,
            postalCode: codigoPostal,
            country: pais
        };

        const user = await User.findById(usuarioId);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        if (!user.shippingAddresses) {
            user.shippingAddresses = [];
        }

        user.shippingAddresses.push(nuevaDireccion);

        await user.save();

        res.status(200).json(nuevaDireccion);
    } catch (error) {
        console.error('Error al guardar la dirección:', error);
        res.status(500).send('Error al guardar la dirección');
    }
});

router.post('/confirmar-compra', isAuthenticated, async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { selectDireccion, direccion, ciudad, estado, codigoPostal, pais, tarjeta, vencimiento, cvv, titular, productos } = req.body;

        let shippingAddress;

        if (selectDireccion && selectDireccion !== 'new') {
            const user = await User.findById(usuarioId).populate('shippingAddresses');
            shippingAddress = user.shippingAddresses.find(addr => addr._id.toString() === selectDireccion);
            if (!shippingAddress) {
                return res.status(400).send('Dirección seleccionada no válida');
            }
        } else if (selectDireccion === 'new') {
            shippingAddress = {
                addressLine1: direccion,
                city: ciudad,
                state: estado,
                postalCode: codigoPostal,
                country: pais
            };
        } else {
            return res.status(400).send('Dirección no válida');
        }

        const productosParaPedido = Object.values(productos).map(producto => ({
            producto: producto.id,
            cantidad: parseInt(producto.cantidad),
            precioUnitario: parseFloat(producto.precio)
        }));

        const nuevoPedido = new Pedido({
            usuario: usuarioId,
            productos: productosParaPedido,
            direccionEnvio: shippingAddress,
            total: parseFloat(req.body.total),
            metodoPago: {
                cardType: 'visa',
                cardNumber: tarjeta,
                expiryDate: vencimiento,
                cardholderName: titular
            }
        });

        await nuevoPedido.save();

        await Carrito.findOneAndUpdate({ usuario: usuarioId }, { productos: [] });

         // Redirigir a la página de confirmación con los detalles del pedido
        res.redirect(`/compra-exitosa/${nuevoPedido._id}`);

    } catch (error) {
        console.error('Error al confirmar la compra:', error);
        res.status(500).send('Error al confirmar la compra');
    }
});

module.exports = router;