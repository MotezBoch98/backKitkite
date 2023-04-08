const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        minlength: 6
    },
    imageUrl: {
        type: String,
        default: undefined
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    }
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        userId: this._id,
        email: this.email
    }, process.env.JWT_KEY, { expiresIn: '2d' });
}
module.exports = mongoose.model('User', userSchema);