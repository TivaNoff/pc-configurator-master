const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "Моя збірка" },
  components: [{ type: String }], 
  totalPrice: { type: Number, default: 0 },
  authorName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Config", configSchema);
