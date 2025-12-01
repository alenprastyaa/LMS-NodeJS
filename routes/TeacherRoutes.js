const express = require("express");
const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacher
} = require("../controllers/TeacherController");
const { AuthMiddleares, GuruOnly, verifyToken, AdminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, AdminOnly, createTeacher);
router.get("/class/me", AuthMiddleares, GuruOnly, getMyTeacher);
router.get("/", verifyToken, getAllTeachers);
router.get("/:id", verifyToken, getTeacherById);
router.put("/:id", verifyToken, AdminOnly, updateTeacher);
router.delete("/:id", verifyToken, AdminOnly, deleteTeacher);

module.exports = router;
