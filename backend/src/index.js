require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// Подключаем статичные файлы фронтенда
app.use(express.static(path.join(__dirname, "../public")));

// Public API
app.use("/api/ping", (req, res) => res.json({ pong: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/components", require("./routes/components"));

// Защищённые маршруты
app.use("/api/configs", require("./routes/configs"));
// Прокси для Newegg-картинок

// Подключение к MongoDB и запуск сервера
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });
