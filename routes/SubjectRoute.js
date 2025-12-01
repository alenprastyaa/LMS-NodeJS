const express = require("express");
const {
    GetSubjects,
    GetSubjectById,
    CreateSubject,
    UpdateSubject,
    DeleteSubject
} = require("../controllers/SubjectController");
const { verifyToken, GuruOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", GetSubjects);
router.get("/:id", GetSubjectById);
router.post("/", verifyToken, GuruOnly, CreateSubject);
router.put("/:id", verifyToken, GuruOnly, UpdateSubject);
router.delete("/:id", verifyToken, GuruOnly, DeleteSubject);

module.exports = router;
