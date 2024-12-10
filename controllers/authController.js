const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบว่ามีชื่อผู้ใช้งานซ้ำหรือไม่
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: "Username is already taken" });

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
