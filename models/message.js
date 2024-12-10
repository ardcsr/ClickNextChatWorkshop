const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: false }, // ไม่บังคับให้มีข้อความเสมอ
  image: { type: String, required: false }, // เก็บรูปภาพเป็น Base64
  room: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);