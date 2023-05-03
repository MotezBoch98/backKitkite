require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const schoolRoutes = require('./routes/school');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const messageRoutes = require('./routes/message');
const path = require('path');
const socketIO = require('socket.io');
const Message = require('./models/message');

const app = express();

// connect to DB
const url = process.env.DATABASE_URL;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose
  .connect(url, options)
  .then(() => { console.log("Database connected successfully...") })
  .catch(err => console.log("Database connection error..."));

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json());   // appliction/json

// make images folder static available in root
app.use('/images' , express.static( path.join(__dirname,'images')));

// Access-Control-Allow
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
});

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/school',schoolRoutes);
app.use('/api/messages', messageRoutes);

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data || undefined;
    res.status(status).json({ message: message , data: data });
});

// SOCKET.IO
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle message events
    socket.on('message', async ({ senderId, receiverId, text }) => {
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            text: text,
        });

        try {
            await message.save();
            // Emit the message to the receiver
            socket.to(receiverId).emit('message', message);
        } catch (error) {
            console.log(error);
            socket.emit('error', 'Error saving message');
        }
    });

    // Handle disconnection events
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data || undefined;
    res.status(status).json({ message: message, data: data });
});