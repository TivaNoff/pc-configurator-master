const express = require("express");
const router = express.Router();
const {
  getComponents,
  getComponentById,
} = require("../controllers/componentController");

router.get("/", getComponents);
router.get("/:id", getComponentById);

module.exports = router;
