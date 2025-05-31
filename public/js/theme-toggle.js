// public/js/theme-toggle.js
import { getTranslation } from "./localization.js"; // Импортируем функцию для получения перевода

document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle");

  const updateButtonText = (currentLang) => {
    if (!themeToggleBtn) return;
    if (document.body.classList.contains("light-theme")) {
      themeToggleBtn.textContent = getTranslation(
        "theme_toggle_dark",
        currentLang
      );
    } else {
      themeToggleBtn.textContent = getTranslation(
        "theme_toggle_light",
        currentLang
      );
    }
  };

  const applyTheme = (theme) => {
    const currentLang = localStorage.getItem("language") || "uk";
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    updateButtonText(currentLang); // Обновляем текст кнопки после применения темы
  };

  // Apply saved theme on initial load
  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme || "dark"); // По умолчанию темная тема

  // Event listener for the theme toggle button
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      let newTheme = "dark";
      if (!document.body.classList.contains("light-theme")) {
        newTheme = "light";
      }
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    });
  }

  // Слушаем событие смены языка для обновления текста кнопки
  window.addEventListener("languageChanged", (event) => {
    updateButtonText(event.detail.lang);
  });
});
