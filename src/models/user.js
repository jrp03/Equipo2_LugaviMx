const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  activo: {
    type: Boolean,
    default: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  shippingAddresses: [{
    type: new Schema({
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      isDefault: { type: Boolean, default: false }
    }, { timestamps: true })
  }],
  paymentMethods: [{
    type: new Schema({
      cardType: { type: String, required: true, enum: ['visa', 'mastercard', 'amex'] },
      cardNumber: { type: String, required: true }, // se mantiene visible internamente
      expiryDate: { type: String, required: true },
      cvv: { type: String, required: false, select: false }, // ✅ ahora no es obligatorio
      cardholderName: { type: String, required: true, trim: true },
      billingAddress: {
        addressLine1: { type: String, trim: true },
        addressLine2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true }
      },
      isDefault: { type: Boolean, default: false }
    }, { timestamps: true })
  }],
  profilePicture: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Métodos para encriptar y comparar contraseñas
userSchema.methods.encriptarContraseña = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.compararContraseña = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
