const Message = require('../models/message');

exports.postMessage = async (req, res, next) => {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
        const error = new Error('Invalid input');
        error.statusCode = 422;
        throw error;
    }

    const message = new Message({
        sender: senderId,
        receiver: receiverId,
        text: text,
    });

    try {
        await message.save();
        res.status(201).json({ message: 'Message sent', data: message });
        // Emit the message to the receiver
        const receiverSocket = io.getSocketForUser(receiverId);
        if (receiverSocket) {
            receiverSocket.emit('message', message);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.getMessages = async (req, res, next) => {
    const { userId, otherUserId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
            ],
        }).sort({ createdAt: 'asc' });

        res.status(200).json({ data: messages });
    } catch (error) {
        console.log(error);
        next(error);
    }
};