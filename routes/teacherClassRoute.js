const express = require("express");
const router = express.Router();
const controller = require("../controllers/TeacherClassController");
const { AdminOnly, verifyToken } = require("../middleware/authMiddleware");

router.post("/assign", verifyToken, AdminOnly, controller.assignTeacherToClass);
router.post("/remove", verifyToken, AdminOnly, controller.removeTeacherFromClass);
router.get("/class/:class_id", AdminOnly, controller.getTeachersByClass);
router.get("/teacher/:teacher_id", AdminOnly, controller.getClassesByTeacher);

router.get("/", verifyToken, controller.getAllTeacherClass);

module.exports = router;
