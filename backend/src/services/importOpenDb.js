require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Component = require("../models/Component");

const OPEN_DB_PATH = path.resolve(__dirname, "../../../open-db");

async function importComponents() {
  // 1) Подключаемся к MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected for import");

  let count = 0;

  // 2) Для каждой категории (CPU, GPU, RAM и т.д.)
  for (const category of fs.readdirSync(OPEN_DB_PATH)) {
    const catPath = path.join(OPEN_DB_PATH, category);
    if (!fs.statSync(catPath).isDirectory()) continue;

    // 3) Для каждого JSON-файла в категории
    for (const fileName of fs
      .readdirSync(catPath)
      .filter((f) => f.endsWith(".json"))) {
      const filePath = path.join(catPath, fileName);
      const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // 4) В JSON может быть два варианта обёртки: либо { … } сразу с полем metadata,
      //    либо { specs: { … } }. Берём тот, что есть:
      const specData = rawData.specs || rawData;

      // 5) Достаём «сырое» поле part_numbers
      const rawPN = specData.metadata?.part_numbers;
      let partNumbers = [];

      if (Array.isArray(rawPN)) {
        // Если это массив — для каждого элемента проверяем длинные пробелы
        partNumbers = rawPN.flatMap((item) => {
          const s = String(item).trim();
          // Если в строке есть подряд 6 и более пробельных символов — разбиваем по ним
          if (/\s{6,}/.test(s)) {
            return s
              .split(/\s{6,}/)
              .map((x) => x.trim())
              .filter(Boolean);
          } else {
            // Иначе берем всю строку как один элемент
            return [s];
          }
        });
      } else if (typeof rawPN === "string") {
        // Если это одна большая строка — проверяем наличие длинных пробельных блоков
        const str = rawPN.trim();
        if (/\s{6,}/.test(str)) {
          partNumbers = str
            .split(/\s{6,}/)
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          // Иначе оставляем всю строку как один элемент массива
          partNumbers = [str];
        }
      }
      // Иначе partNumbers остаётся пустым массивом

      // 6) Подменяем в объекте спецификаций
      specData.metadata = specData.metadata || {};
      specData.metadata.part_numbers = partNumbers;

      // 7) Формируем документ для Mongo
      const doc = {
        opendb_id:
          rawData.id || specData.opendb_id || fileName.replace(/\.json$/, ""),
        category,
        specs: specData,
        storeIds: {},
        prices: {},
      };

      // 8) Сохраняем или обновляем компонент
      await Component.findOneAndUpdate({ opendb_id: doc.opendb_id }, doc, {
        upsert: true,
        new: true,
      });
      count++;
      if (count % 100 === 0) {
        console.log(`Imported ${count} components...`);
      }
    }
  }

  console.log(`✅ Finished import: ${count} components processed.`);
  process.exit(0);
}

importComponents().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
