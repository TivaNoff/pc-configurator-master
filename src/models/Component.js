const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
  opendb_id: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  storeIds: {
    Ekatalog: String,
  },
  prices: {
    Ekatalog: Number,
  },
  storeImg: {
    Ekatalog: String,
  },
});

module.exports = mongoose.model("Component", componentSchema);
