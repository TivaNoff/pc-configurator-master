// backend/src/routes/configs.js
const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const authMiddleware = require("../utils/authMiddleware"); // Middleware для проверки аутентификации

// Применить middleware аутентификации ко всем маршрутам конфигураций
// Предполагается, что authMiddleware.protect - это функция
router.use(authMiddleware.protect);

// Маршруты
router.get("/", configController.getUserConfigs); // Получить все конфигурации пользователя
router.post("/", configController.createConfig); // Создать новую конфигурацию
router.get("/:id", configController.getConfigById); // Получить конкретную конфигурацию по ID
router.put("/:id", configController.updateConfig); // Обновить конфигурацию по ID
router.delete("/:id", configController.deleteConfig); // Удалить конфигурацию по ID

module.exports = router;
