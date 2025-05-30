const Component = require("../models/Component");

// GET /api/components
exports.getComponents = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = category ? { category } : {};
    const [data, total] = await Promise.all([
      Component.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Component.countDocuments(filter),
    ]);
    res.json({
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/components/:id
exports.getComponentById = async (req, res) => {
  try {
    const comp = await Component.findOne({ opendb_id: req.params.id });
    if (!comp) return res.status(404).json({ message: "Not found" });
    res.json(comp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
