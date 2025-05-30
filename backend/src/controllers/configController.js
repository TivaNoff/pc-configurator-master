const Config = require("../models/Config");
const Component = require("../models/Component");

// POST /api/configs
exports.createConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    // если components не передан — считаем как пустой массив
    const { name, components = [] } = req.body;

    // только проверяем, что это массив (пустой — ОК)
    if (!Array.isArray(components)) {
      return res.status(400).json({ message: "Components array required" });
    }

    // считаем totalPrice (если components пуст — вернёт 0)
    const comps = components.length
      ? await Component.find({ opendb_id: { $in: components } })
      : [];
    const totalPrice = comps.reduce((sum, c) => {
      const vals = Object.values(c.prices || {}).filter(
        (v) => typeof v === "number"
      );
      return sum + (vals.length ? Math.min(...vals) : 0);
    }, 0);

    const newConfig = new Config({
      user: userId,
      name: name || "Моя збірка",
      components,
      totalPrice,
    });

    const saved = await newConfig.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/configs
exports.getConfigs = async (req, res) => {
  try {
    const configs = await Config.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(configs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/configs/:id
exports.getConfigById = async (req, res) => {
  try {
    const cfg = await Config.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!cfg) return res.status(404).json({ message: "Not found" });
    return res.json(cfg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/configs/:id
exports.updateConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    const cfgId = req.params.id;
    const { name, components } = req.body;

    // если пришёл components, то он должен быть массивом
    if (components !== undefined && !Array.isArray(components)) {
      return res.status(400).json({ message: "Components must be array" });
    }

    // пересчитаем totalPrice только если передали components
    let totalPrice;
    if (Array.isArray(components)) {
      const comps = components.length
        ? await Component.find({ opendb_id: { $in: components } })
        : [];
      totalPrice = comps.reduce((sum, c) => {
        const vals = Object.values(c.prices || {}).filter(
          (v) => typeof v === "number"
        );
        return sum + (vals.length ? Math.min(...vals) : 0);
      }, 0);
    }

    // Готовим объект для обновления
    const update = {};
    if (name !== undefined) update.name = name;
    if (components !== undefined) update.components = components;
    if (totalPrice !== undefined) update.totalPrice = totalPrice;

    const updated = await Config.findOneAndUpdate(
      { _id: cfgId, user: userId },
      { $set: update },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/configs/:id
exports.deleteConfig = async (req, res) => {
  try {
    const result = await Config.deleteOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};
