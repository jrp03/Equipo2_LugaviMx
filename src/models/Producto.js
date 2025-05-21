const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  categoria: String,
  stock: Number,
},
{
  timestamps: true,
  versionKey: false,
}
);

module.exports = mongoose.model('Producto', productoSchema);
