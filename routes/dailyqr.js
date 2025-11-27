const express = require("express");
const router = express.Router();
const { generateDailyQR } = require("../controllers/DailyQRController");

router.get("/admin/generate-qr", generateDailyQR);

module.exports = router;
