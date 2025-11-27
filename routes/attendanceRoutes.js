const express = require("express");
const { AuthMiddleares } = require("../middleware/authMiddleware");
const { scanQR, GetAllAttendance, GetMyAttendanceToday, GetAllMyAttendance } = require("../controllers/Attendance");
const router = express.Router();

router.get("/scan-qr", AuthMiddleares, scanQR);
router.get("/all", GetAllAttendance);
router.get("/me/today", AuthMiddleares, GetMyAttendanceToday);
router.get("/me", AuthMiddleares, GetAllMyAttendance);

module.exports = router;
