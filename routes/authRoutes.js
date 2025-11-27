const express = require("express");
const router = express.Router();
const { register, login, GetUser, GetMyData, UpdateUser } = require("../controllers/authController");
const { AdminOnly, AuthMiddleares, verifyToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/", GetUser);
router.put("/:id", AdminOnly, UpdateUser);
router.get("/my-data", verifyToken, GetMyData);

module.exports = router;
