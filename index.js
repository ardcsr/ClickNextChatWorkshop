require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const Message = require('./models/message');

connectDB();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());
app.use('/auth', authRoutes);
app.use(express.static('public'));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.id}`);

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    console.log(`${socket.user.id} joined room: ${room}`);
  });

  socket.on('sendMessage', async ({ text, image, room }) => {
    const message = new Message({
      username: socket.user.id,
      text,
      image,
      room
    });
    await message.save();
    io.to(room).emit('newMessage', message);
  });

  socket.on('disconnect', () => console.log('❌ User disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
