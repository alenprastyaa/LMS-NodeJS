const express = require("express");
const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacher
} = require("../controllers/TeacherController");
const { AuthMiddleares, GuruOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createTeacher);
router.get("/class/me", AuthMiddleares, GuruOnly, getMyTeacher);
router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

module.exports = router;
