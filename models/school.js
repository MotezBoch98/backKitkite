const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const schoolSchema = new mongoose.Schema({
    name: {
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
        minlength:6
    },
    imageUrl: {
        type: String,
        default: undefined
    },
    location: {
        type: Object,
        default: {
            longitude: 0,
            latitude: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    }
}, { timestamps: true });

schoolSchema.methods.generateAuthToken = function() {
    return jwt.sign({
        schoolId: this._id,
        email: this.email
    }, process.env.JWT_KEY || 'mysecretkey', {expiresIn: '2d'});
}
module.exports = mongoose.model('School', schoolSchema);
