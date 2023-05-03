const mongoose = require('mongoose');
const User = require('../models/user');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

messageSchema.pre('save', function (next) {
    const message = this;

    User.findById(message.receiver)
        .then(user => {
            if (!user) {
                const error = new Error('Receiver user not found');
                error.statusCode = 404;
                throw error;
            }
            next();
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
});



const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
