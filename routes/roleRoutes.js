const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { verifyToken, AdminOnly } = require("../middleware/authMiddleware");

router.get("/", roleController.GetAllRoles);
router.get("/:id", AdminOnly, roleController.getRoleById);
router.post("/", AdminOnly, roleController.createRole);
router.put("/:id", AdminOnly, roleController.updateRole);
router.delete("/:id", AdminOnly, roleController.deleteRole);

module.exports = router;