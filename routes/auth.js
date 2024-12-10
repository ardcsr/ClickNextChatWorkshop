const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/register.html", (req, res) =>
  res.sendFile(__dirname + "/public/register.html")
);
router.get("/login.html", (req, res) =>
  res.sendFile(__dirname + "/public/login.html")
);
router.get("/index.html", (req, res) =>
  res.sendFile(__dirname + "/public/index.html")
);
module.exports = router;
