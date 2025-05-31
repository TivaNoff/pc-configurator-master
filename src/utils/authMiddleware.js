// backend/src/utils/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Убедитесь, что путь к модели User правильный

const protect = async (req, res, next) => {
  // Проверяем, определен ли JWT_SECRET в переменных окружения
  if (!process.env.JWT_SECRET) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не определен на сервере!");
    // ВАЖНО: В рабочей среде не следует отправлять такую подробную ошибку клиенту.
    // Это сообщение предназначено для помощи в отладке.
    return res.status(500).json({
      message:
        "Ошибка конфигурации сервера аутентификации (отсутствует JWT_SECRET).",
    });
  }

  let token;

  // Проверяем наличие заголовка Authorization и его формат Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Извлекаем токен из заголовка
      token = req.headers.authorization.split(" ")[1];

      // Дополнительная проверка, если split вернул пустую строку или токен отсутствует
      if (!token || token === "null" || token === "undefined") {
        // 'null' или 'undefined' как строки
        return res.status(401).json({
          message:
            "Не авторизован, токен отсутствует в заголовке Bearer или имеет неверное значение.",
        });
      }

      // Верифицируем токен с использованием JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ищем пользователя по ID из декодированного токена, исключая пароль
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        // Пользователь с таким ID не найден в БД, хотя токен может быть валидным
        return res.status(401).json({
          message:
            "Не авторизован, пользователь для предоставленного токена не найден.",
        });
      }

      // Если все проверки пройдены, передаем управление следующему обработчику
      next();
    } catch (error) {
      // Обрабатываем ошибки верификации токена
      console.error(
        "Ошибка аутентификации (проверка токена):",
        error.name,
        error.message
      );
      let clientMessage =
        "Не авторизован, токен недействителен или возникла ошибка при его проверке.";
      if (error.name === "TokenExpiredError") {
        clientMessage = "Не авторизован, срок действия токена истек.";
      } else if (error.name === "JsonWebTokenError") {
        // JsonWebTokenError включает ошибки 'jwt malformed', 'jwt signature is required', 'invalid signature' и т.д.
        clientMessage = `Не авторизован, ошибка формата или подписи токена (${error.message}).`;
      }
      return res.status(401).json({ message: clientMessage });
    }
  } else {
    // Заголовок Authorization отсутствует или не начинается с 'Bearer'
    return res.status(401).json({
      message:
        "Не авторизован, заголовок Authorization отсутствует или имеет неверный формат.",
    });
  }
};

// Экспортируем middleware
module.exports = { protect };
