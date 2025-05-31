const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { email, password, username } = req.body; // MODIFIED: Added username
    if (!email || !password || !username) {
      // MODIFIED: Added username to validation
      return res
        .status(400)
        .json({ message: "Ім'я користувача, email та пароль обовʼязкові" });
    }

    // Check for existing email
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Користувач з таким email вже існує" });
    }

    // Check for existing username
    existingUser = await User.findOne({ username }); // ADDED: Check for username uniqueness
    if (existingUser) {
      // ADDED: Check for username uniqueness
      return res
        .status(409)
        .json({ message: "Користувач з таким ім'ям вже існує" }); // ADDED: Check for username uniqueness
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, passwordHash }); // MODIFIED: Added username
    res.status(201).json({ message: "Користувача створено", userId: user._id });
  } catch (err) {
    console.error(err);
    // ADDED: More specific error for unique constraint violation
    if (err.code === 11000 && err.keyPattern && err.keyValue) {
      if (err.keyPattern.email) {
        return res.status(409).json({
          message: "Користувач з таким email вже існує (помилка БД).",
          error: err.message,
        });
      }
      if (err.keyPattern.username) {
        return res.status(409).json({
          message: "Користувач з таким ім'ям вже існує (помилка БД).",
          error: err.message,
        });
      }
    }
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // Note: Login still uses email. If you want to allow login by username, this needs to be changed.
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Невірні облікові дані" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Невірні облікові дані" });
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username }, // ADDED: username to JWT payload (optional but can be useful)
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
};
