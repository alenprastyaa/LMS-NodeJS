const express = require("express");
const router = express.Router();
const { verifyToken, AuthMiddleares, StudentOnly, AdminOnly } = require("../middleware/authMiddleware");
const {
    CreateAssign,
    GetAllAssign,
    GetAssignByUser,
    UpdateAssign,
    DeleteAssign
} = require("../controllers/AssignMaterialController");


router.post("/", AuthMiddleares, StudentOnly, CreateAssign);
router.get("/", verifyToken, AuthMiddleares, GetAllAssign);
router.get("/assign/me", AuthMiddleares, GetAssignByUser);
router.put("/:id", AuthMiddleares, StudentOnly, UpdateAssign);
router.delete("/:id", AuthMiddleares, StudentOnly, DeleteAssign);

module.exports = router;
