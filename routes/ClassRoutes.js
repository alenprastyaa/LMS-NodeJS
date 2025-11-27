const express = require("express");
const router = express.Router();
const {
    getAllClass,
    getClassById,
    createClass,
    updateClass,
    deleteClass
} = require("../controllers/ClassController");
const { AdminOnly, AuthMiddleares } = require("../middleware/authMiddleware");

router.get("/", AuthMiddleares, getAllClass);
router.get("/:id", AuthMiddleares, AdminOnly, getClassById);
router.post("/", AuthMiddleares, AdminOnly, createClass);
router.put("/:id", AuthMiddleares, AdminOnly, updateClass);
router.delete("/:id", AuthMiddleares, AdminOnly, deleteClass);

module.exports = router;
