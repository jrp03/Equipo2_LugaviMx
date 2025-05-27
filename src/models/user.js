const mongoose = require('mongoose');
const {Schema} =  mongoose;
const  bcrypt =require('bcrypt-nodejs');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Añade un índice único para el email
        trim: true,   // Elimina espacios en blanco al principio y al final
        lowercase: true // Convierte el email a minúsculas
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
    phoneNumber: {
        type: String,
        trim: true
    },
    shippingAddresses: [{
        type: new Schema({ // Define un subdocumento para la dirección
            addressLine1: { type: String, required: true, trim: true },
            addressLine2: { type: String, trim: true }, // Opcional
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            postalCode: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            isDefault: { type: Boolean, default: false } // Para marcar una dirección como predeterminada
        }, { timestamps: true }) // Agrega timestamps a cada dirección
    }],
    paymentMethods: [{
        type: new Schema({ // Define un subdocumento para el método de pago
            cardType: { type: String, required: true, enum: ['visa', 'mastercard', 'amex'] }, // Enum para tipos de tarjeta
            cardNumber: { type: String, required: true },
            expiryDate: { type: String, required: true }, // MM/YY
            cvv: { type: String, required: true },
            cardholderName: { type: String, required: true, trim: true },
            billingAddress: {
                addressLine1: { type: String, trim: true },
                addressLine2: { type: String, trim: true },
                city: { type: String, trim: true },
                state: { type: String, trim: true },
                postalCode: { type: String, trim: true },
                country: { type: String, trim: true }
            },
            isDefault: { type: Boolean, default: false } // Para marcar un método de pago como predeterminado
        }, { timestamps: true }) // Agrega timestamps a cada método de pago
    }],
    profilePicture: {
        type: String, // Almacena la URL de la imagen de perfil
        default: null // Puedes tener una imagen por defecto
    },
    // Puedes agregar más campos relacionados con el usuario aquí
}, { timestamps: true }); // Opciones del Schema para createdAt y updatedAt

userSchema.methods.encriptarContraseña= (password)=>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.compararContraseña = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);