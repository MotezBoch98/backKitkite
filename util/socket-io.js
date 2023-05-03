const Message = require('../models/message');



module.exports = {
    init: (server) => {
        const io = require('socket.io')(server);

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // Handle message events
            socket.on('message', ({ senderId, receiverId, text }) => {
                const message = new Message({
                    sender: senderId,
                    receiver: receiverId,
                    text: text,
                });
                message.save();

                // Emit the message to the receiver
                socket.to(receiverId).emit('message', message);
            });

            // Handle disconnection events
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error('socket.io not initialized');
        }
        return io;
    },
};