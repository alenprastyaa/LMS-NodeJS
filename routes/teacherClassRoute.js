const express = require("express");
const router = express.Router();
const controller = require("../controllers/TeacherClassController");
const { AdminOnly } = require("../middleware/authMiddleware");

router.post("/assign", AdminOnly, controller.assignTeacherToClass);
router.post("/remove", AdminOnly, controller.removeTeacherFromClass);

router.get("/class/:class_id", AdminOnly, controller.getTeachersByClass);
router.get("/teacher/:teacher_id", AdminOnly, controller.getClassesByTeacher);

router.get("/", controller.getAllTeacherClass);

module.exports = router;
