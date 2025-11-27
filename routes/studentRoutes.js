const express = require('express');
const { createStudent, getAllStudents, getStudentById, getStudentsByClass, updateStudent, deleteStudent } = require('../controllers/StudentController');
const router = express()




router.post("/", createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.get("/class/:class_id", getStudentsByClass);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);


module.exports = router