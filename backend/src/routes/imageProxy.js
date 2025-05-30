const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/newegg/:sku", async (req, res) => {
  const { sku } = req.params;
  const url = `https://c1.neweggimages.com/ProductImageCompressAll1280/${sku}.jpg`;
  try {
    const response = await axios.get(url, { responseType: "stream" });
    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (err) {
    console.error("Newegg proxy error:", err.message);
    res.sendStatus(404);
  }
});

module.exports = router;
