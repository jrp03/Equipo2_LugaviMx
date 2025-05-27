const mongoose = require('mongoose');
const { Schema } = mongoose;

const pedidoSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al usuario que realizó el pedido
    productos: [{
        producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true }, // Referencia al producto
        cantidad: { type: Number, required: true, min: 1 }, // Cantidad del producto en el pedido
        precioUnitario: { type: Number, required: true } // Precio unitario al momento de la compra
    }],
    direccionEnvio: {
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, trim: true }, // Opcional
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true }
    },
    total: { type: Number, required: true, min: 0 }, // Total del pedido
    fechaPedido: { type: Date, default: Date.now }, // Fecha en que se realizó el pedido
    estado: { type: String, enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' }, // Estado del pedido
    metodoPago: {
        cardType: { type: String, required: true, enum: ['visa', 'mastercard', 'amex'] }, // Enum para tipos de tarjeta
        cardNumber: { type: String, required: true },
        expiryDate: { type: String, required: true }, // MM/YY
        cardholderName: { type: String, required: true, trim: true },
    }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);