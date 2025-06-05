const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не определен на сервере!");

    return res.status(500).json({
      message:
        "Ошибка конфигурации сервера аутентификации (отсутствует JWT_SECRET).",
    });
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({
          message:
            "Не авторизован, токен отсутствует в заголовке Bearer или имеет неверное значение.",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message:
            "Не авторизован, пользователь для предоставленного токена не найден.",
        });
      }

      next();
    } catch (error) {
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
        clientMessage = `Не авторизован, ошибка формата или подписи токена (${error.message}).`;
      }
      return res.status(401).json({ message: clientMessage });
    }
  } else {
    return res.status(401).json({
      message:
        "Не авторизован, заголовок Authorization отсутствует или имеет неверный формат.",
    });
  }
};

module.exports = { protect };
