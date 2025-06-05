const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const authMiddleware = require("../utils/authMiddleware");

router.use(authMiddleware.protect);

router.get("/", configController.getUserConfigs);
router.post("/", configController.createConfig);
router.get("/:id", configController.getConfigById);
router.put("/:id", configController.updateConfig);
router.delete("/:id", configController.deleteConfig);

module.exports = router;
