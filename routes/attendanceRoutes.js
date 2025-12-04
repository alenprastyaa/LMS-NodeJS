const express = require("express");
const { AuthMiddleares } = require("../middleware/authMiddleware");
const { scanQR, GetAllAttendance, GetMyAttendanceToday, GetAllMyAttendance } = require("../controllers/Attendance");
const { verify } = require("jsonwebtoken");
const router = express.Router();

router.get("/scan-qr", verify, AuthMiddleares, scanQR);
router.get("/all", GetAllAttendance);
router.get("/me/today", AuthMiddleares, GetMyAttendanceToday);
router.get("/me", AuthMiddleares, GetAllMyAttendance);

module.exports = router;
