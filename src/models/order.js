// models/order.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const pedidoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  productos: [
    {
      producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1
      },
      precioUnitario: {
        type: Number,
        required: true
      }
    }
  ],

  direccionEnvio: {
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true }
  },

  total: {
    type: Number,
    required: true,
    min: 0
  },

  fechaPedido: {
    type: Date,
    default: Date.now
  },

  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },

  metodoPago: {
    cardType: {
      type: String,
      required: true,
      enum: ['visa', 'mastercard', 'amex']
    },
    cardNumber: {
      type: String,
      required: true
    },
    expiryDate: {
      type: String,
      required: true
    },
    cardholderName: {
      type: String,
      required: true,
      trim: true
    }
  },

  comentario: {
    type: String,
    default: ''
  },

  notificarCliente: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Pedido', pedidoSchema);
