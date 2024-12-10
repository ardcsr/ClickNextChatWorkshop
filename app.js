const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
const Message = require('./models/message'); // นำเข้าโมเดล Mongoose

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://admin:OPbftDbfEW1IEu0W@workshop.tjr2w.mongodb.net/?retryWrites=true&w=majority&appName=workshop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('📦 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 📌 Route สำหรับดึงข้อความทั้งหมด
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 📌 เมื่อมีการเชื่อมต่อ Socket
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // รับข้อความใหม่จาก client
  socket.on('sendMessage', async (data) => {
    try {
      const message = new Message({ username: data.username, text: data.text });
      await message.save();

      // ส่งข้อความให้ทุกคนในห้อง
      io.emit('newMessage', message);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // ตรวจจับเมื่อผู้ใช้ตัดการเชื่อมต่อ
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
