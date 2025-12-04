const express = require("express");
const router = express.Router();
const { register, login, GetUser, GetMyData, UpdateUser, GenerateUserExcel, DeleteUser } = require("../controllers/authController");
const { AdminOnly, AuthMiddleares, verifyToken } = require("../middleware/authMiddleware");
const uploadExcel = require("../middleware/uploadExcel");

router.post("/", register);
router.post("/login", login);
router.get("/", GetUser);
router.delete("/:id", DeleteUser);
router.put("/:id", UpdateUser);
router.get("/my-data", verifyToken, GetMyData);
router.post("/generate-excel", uploadExcel.single("file"), GenerateUserExcel);

module.exports = router;
