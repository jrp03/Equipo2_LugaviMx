const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  precio: {
    type: Number,
    required: true,
    min: 0,
  },
categoria: {
  type: String,
  required: true,
  enum: [
    'Vestidos Midi',
    'Vestidos Maxi',
    'Vestidos Mini',
    'Vestidos de Fiesta',
    'Vestidos de Noche',
    'Vestidos de Cóctel',
    'Vestidos de Día',
    'Vestidos con Encaje',
    'Vestidos Estampados',
    'Vestidos Lisos',
    'Vestidos de Algodón',
    'Vestidos de Seda',
    'Vestidos de novia',
    'Otros',
  ],
},
  subcategoria: {
    type: String,
    trim: true,
  },
  tallas: {
    type: [String],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unitalla'],
    default: ['Unitalla'],
  },
  // --- CAMPO DE COLOR AÑADIDO ---
  color: {
    type: String,
    trim: true,
    required: true, // Opcional: Si el color es obligatorio
    // enum: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Otro'], // Opcional: Lista de colores predefinidos
  },
  // --- FIN CAMPO DE COLOR ---
  imagenes: {
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array.length > 0;
      },
      message: 'Debe haber al menos una imagen para el producto',
    },
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  destacado: {
    type: Boolean,
    default: false,
  },
  envioGratis: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// ✅ Evita error de sobreescritura del modelo
module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
