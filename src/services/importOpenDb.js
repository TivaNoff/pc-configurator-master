require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Component = require("../models/Component");

const OPEN_DB_PATH = path.resolve(__dirname, "../../../open-db");

async function importComponents() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected for import");

  let count = 0;

  for (const category of fs.readdirSync(OPEN_DB_PATH)) {
    const catPath = path.join(OPEN_DB_PATH, category);
    if (!fs.statSync(catPath).isDirectory()) continue;

    for (const fileName of fs
      .readdirSync(catPath)
      .filter((f) => f.endsWith(".json"))) {
      const filePath = path.join(catPath, fileName);
      const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const specData = rawData.specs || rawData;

      const rawPN = specData.metadata?.part_numbers;
      let partNumbers = [];

      if (Array.isArray(rawPN)) {
        partNumbers = rawPN.flatMap((item) => {
          const s = String(item).trim();

          if (/\s{6,}/.test(s)) {
            return s
              .split(/\s{6,}/)
              .map((x) => x.trim())
              .filter(Boolean);
          } else {
            return [s];
          }
        });
      } else if (typeof rawPN === "string") {
        const str = rawPN.trim();
        if (/\s{6,}/.test(str)) {
          partNumbers = str
            .split(/\s{6,}/)
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          partNumbers = [str];
        }
      }

      specData.metadata = specData.metadata || {};
      specData.metadata.part_numbers = partNumbers;

      const doc = {
        opendb_id:
          rawData.id || specData.opendb_id || fileName.replace(/\.json$/, ""),
        category,
        specs: specData,
        storeIds: {},
        prices: {},
      };

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
