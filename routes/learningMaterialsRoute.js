const express = require("express");
const router = express.Router();

const {
    getAllLearningMaterials,
    getLearningMaterialById,
    createLearningMaterial,
    updateLearningMaterial,
    deleteLearningMaterial,
    createLearningMaterialGuru,
    getMyLearningMaterials,
    getMyLearningMaterialsStudent,
    getLearningMaterialsByClass
} = require("../controllers/learningMaterialsController");
const { GuruOnly, AuthMiddleares, AdminOnly, StudentOnly } = require("../middleware/authMiddleware");

router.get("/", AuthMiddleares, getAllLearningMaterials);
router.post("/", AuthMiddleares, AdminOnly, createLearningMaterial);
router.post("/guru", AuthMiddleares, GuruOnly, createLearningMaterialGuru);
router.get("/my/guru", AuthMiddleares, GuruOnly, getMyLearningMaterials);
router.put("/:id", AuthMiddleares, GuruOnly, updateLearningMaterial);
router.delete("/:id", AuthMiddleares, GuruOnly, deleteLearningMaterial);
router.get("/my/student", AuthMiddleares, StudentOnly, getMyLearningMaterialsStudent);
router.get("/class/:classId", AuthMiddleares, getLearningMaterialsByClass);
router.get("/:id", getLearningMaterialById);

module.exports = router;