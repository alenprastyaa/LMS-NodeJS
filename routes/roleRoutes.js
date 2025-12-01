const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { verifyToken, AdminOnly } = require("../middleware/authMiddleware");

router.get("/", verifyToken, AdminOnly, roleController.GetAllRoles);
router.get("/:id", verifyToken, AdminOnly, roleController.getRoleById);
router.post("/", verifyToken, AdminOnly, roleController.createRole);
router.put("/:id", verifyToken, AdminOnly, roleController.updateRole);
router.delete("/:id", verifyToken, AdminOnly, roleController.deleteRole);

module.exports = router;