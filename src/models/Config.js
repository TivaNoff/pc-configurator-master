const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "Моя збірка" },
  components: [{ type: String }], // массив opendb_id
  totalPrice: { type: Number, default: 0 },
  authorName: { type: String }, // Added to store the username of the author
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Config", configSchema);
