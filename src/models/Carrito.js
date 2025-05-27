const mongoose = require('mongoose');
const { Schema } = mongoose;

const carritoSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo de Usuario
    required: true,
  },
  productos: [{
    producto: {
      type: Schema.Types.ObjectId,
      ref: 'Producto', // Referencia al modelo de Producto
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model('Carrito', carritoSchema);