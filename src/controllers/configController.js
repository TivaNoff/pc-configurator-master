// backend/src/controllers/configController.js
const Config = require("../models/Config");
const Component = require("../models/Component"); // If you need to populate component details

// Get all configurations for the logged-in user
exports.getUserConfigs = async (req, res) => {
  try {
    // Ensure req.user is populated and has an id
    if (!req.user || !req.user.id) {
      console.error(
        "User not authenticated or user.id is missing in getUserConfigs"
      );
      return res.status(401).json({ message: "User not authenticated" });
    }
    // Corrected: Query by the 'user' field as defined in the Config schema
    const configs = await Config.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(configs);
  } catch (error) {
    console.error("Error fetching user configs:", error);
    res
      .status(500)
      .json({ message: "Error fetching configurations", error: error.message });
  }
};

// Get a specific configuration by ID
exports.getConfigById = async (req, res) => {
  try {
    // Ensure req.user is populated and has an id
    if (!req.user || !req.user.id) {
      console.error(
        "User not authenticated or user.id is missing in getConfigById"
      );
      return res.status(401).json({ message: "User not authenticated" });
    }
    const config = await Config.findOne({
      _id: req.params.id,
      user: req.user.id, // Corrected: find by 'user' field
    }).populate("components");

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching config by ID:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid configuration ID format" });
    }
    res.status(500).json({
      message: "Error fetching configuration details",
      error: error.message,
    });
  }
};

// Create a new configuration
exports.createConfig = async (req, res) => {
  const { name, components, totalPrice, compatibilityIssues } = req.body;
  try {
    // Ensure req.user is populated by authMiddleware and has id & username
    if (!req.user || !req.user.id) {
      console.error(
        "User not authenticated or user.id is missing in createConfig"
      );
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newConfig = new Config({
      user: req.user.id, // Corrected: use 'user' to match the schema
      authorName: req.user.username,
      name: name || "Untitled Build",
      components: components || [],
      totalPrice: totalPrice || 0,
      compatibilityIssues: compatibilityIssues || [],
    });
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    console.error("Error creating config:", error);
    // Log the validation errors if any for more details
    if (error.name === "ValidationError") {
      console.error("Validation Errors:", error.errors);
    }
    res
      .status(500)
      .json({ message: "Error creating configuration", error: error.message });
  }
};

// Update an existing configuration
exports.updateConfig = async (req, res) => {
  const { name, components, totalPrice, compatibilityIssues } = req.body;
  try {
    // Ensure req.user is populated and has an id
    if (!req.user || !req.user.id) {
      console.error(
        "User not authenticated or user.id is missing in updateConfig"
      );
      return res.status(401).json({ message: "User not authenticated" });
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (components !== undefined) updateData.components = components;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (compatibilityIssues !== undefined)
      updateData.compatibilityIssues = compatibilityIssues;

    const updatedConfig = await Config.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Corrected: find by 'user' field
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("components");

    if (!updatedConfig) {
      return res
        .status(404)
        .json({ message: "Configuration not found or user not authorized" });
    }
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid configuration ID format" });
    }
    res
      .status(500)
      .json({ message: "Error updating configuration", error: error.message });
  }
};

// Delete a configuration
exports.deleteConfig = async (req, res) => {
  try {
    // Ensure req.user is populated and has an id
    if (!req.user || !req.user.id) {
      console.error(
        "User not authenticated or user.id is missing in deleteConfig"
      );
      return res.status(401).json({ message: "User not authenticated" });
    }
    const deletedConfig = await Config.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id, // Corrected: find by 'user' field
    });
    if (!deletedConfig) {
      return res
        .status(404)
        .json({ message: "Configuration not found or user not authorized" });
    }
    res.json({ message: "Configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting config:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ message: "Invalid configuration ID format" });
    }
    res
      .status(500)
      .json({ message: "Error deleting configuration", error: error.message });
  }
};
