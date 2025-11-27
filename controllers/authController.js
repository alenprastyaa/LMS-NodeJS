// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role, Students } = require("../models"); // Import Students model
const Class = require("../models/Class");
require("dotenv").config();

const register = async (req, res) => {
    try {
        const { username, password, email, role_id, status } = req.body;
        if (!username || !password || !email || !role_id) {
            return res.status(400).json({ success: false, message: "username, password, email and role are required" });
        }
        const role = await Role.findByPk(role_id);
        if (!role) return res.status(400).json({ success: false, message: "Invalid role" });
        const exists = await User.findOne({ where: { username } });
        if (exists) return res.status(409).json({ success: false, message: "Username or email already used" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            password: hashed,
            email,
            role_id,
            status
        });

        const { password: _p, ...safe } = user.toJSON();
        res.status(201).json({ success: true, data: safe });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }
        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Role,
                    attributes: ["id", "role_name"]
                },
                {
                    model: Students, // Eager load Students model
                    attributes: ["class_id"],
                    required: false // Make it optional, so users without student record can still log in
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Status User Belum Aktif"
            });
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );
        const { password: _p, ...safe } = user.toJSON();

        let class_id = null;
        if (user.Role && user.Role.role_name === "Siswa" && user.Student) {
            class_id = user.Student.class_id;
        }

        res.json({
            success: true,
            token,
            data: { ...safe, class_id }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const GetUser = async (req, res) => {
    try {
        const users = await User.findAll({
            include: {
                model: Role,
                attributes: ["role_name"]
            }
        });

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Belum ada User terdaftar"
            });
        }
        const result = users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            status: u.status,
            full_name: u.full_name,
            role_name: u.role?.role_name || null
        }));

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


const GetMyData = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude: ["password"] },

        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Data user tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



const UpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateUser = req.body
        const checkUser = await User.findByPk(id)
        if (!checkUser) {
            return res.json({ "message": "User tidak ditemukan" })
        }
        await User.update(updateUser, {
            where: { id }
        })
        const updatedUser = await User.findByPk(id);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        res.json({ "message": error })
    }

}
module.exports = { register, login, GetUser, GetMyData, UpdateUser };
