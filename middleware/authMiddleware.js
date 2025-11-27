const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, attributes: ["role_name"] }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User with this token no longer exists"
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const AuthMiddleares = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(400).json({
                status: 401,
                message: "Token Tidak Tersedia"
            })
        }
        const token = authHeader.split(" ")[1]
        if (!token) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Format Token Salah"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({
            status: 400,
            message: error.message
        })
    }
}
const AdminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        const roleName = req.user.role?.role_name || req.user.Role?.role_name;

        if (!roleName || !["Admin"].includes(roleName)) {
            return res.status(403).json({
                success: false,
                message: "Akses khusus Admin"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const GuruOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        const roleName = req.user.role?.role_name || req.user.role?.role_name;

        if (!roleName || !["Guru", "Admin"].includes(roleName)) {
            return res.status(403).json({
                success: false,
                message: "Akses khusus Guru"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const StudentOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        const roleName = req.user.role?.role_name || req.user.Role?.role_name;

        if (!roleName || !["Siswa", "Admin"].includes(roleName)) {
            return res.status(403).json({
                success: false,
                message: "Akses khusus Siswa"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = { verifyToken, AuthMiddleares, AdminOnly, GuruOnly, StudentOnly };
