// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role, Students } = require("../models"); // Import Students model
const Class = require("../models/Class");
require("dotenv").config();
const { Op } = require("sequelize");
const XLSX = require("xlsx");

const register = async (req, res) => {
    try {
        const { username, password, email, role_id, class_id, status, full_name, parent_email, parent_contact } = req.body;
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
            parent_email,
            parent_contact,
            email,
            role_id,
            class_id,
            status,
            full_name
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
            role: user.role,
            class_id: user.class_id,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );
        const { password: _p, ...safe } = user.toJSON();



        res.json({
            success: true,
            token,
            data: { ...safe }
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
        const {
            page = 1,
            limit = 10,
            search = "",
            role_name = ""
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        const where = {};
        if (search) {
            where[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { full_name: { [Op.like]: `%${search}%` } },
                { "$role.role_name$": { [Op.like]: `%${search}%` } }
            ];
        }
        const roleInclude = {
            model: Role,
            attributes: ["role_name"]
        };
        if (role_name) {
            roleInclude.where = { role_name: { [Op.like]: `%${role_name}%` } };
            roleInclude.required = true;
        }

        const { rows, count } = await User.findAndCountAll({
            where,
            include: roleInclude,
            limit: limitNum,
            offset,
            order: [["id", "DESC"]],
            distinct: true
        });

        const result = rows.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            status: u.status,
            full_name: u.full_name,
            class_id: u.class_id,
            parent_email: u.parent_email,
            parent_contact: u.parent_contact,
            role_name: u.role?.role_name || null
        }));

        return res.json({
            success: true,
            data: result,
            pagination: {
                total: count,
                page: pageNum,
                limit: limitNum,
                total_pages: Math.ceil(count / limitNum)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




const GetMyData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role } = req.user
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
            data: {
                user,
                role: role.role_name,

            },
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
const GenerateUserExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Upload file Excel" });
        }

        const fileBuffer = req.file.buffer;
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (excelData.length === 0) {
            return res.status(400).json({ success: false, message: "Excel kosong" });
        }

        const createdUsers = [];
        const failedUsers = [];

        for (const row of excelData) {
            try {
                const {
                    username,
                    parent_email,
                    parent_contact,
                    email,
                    password,
                    full_name,
                    role_id,
                    class_id,
                    status = "active"
                } = row;

                if (!username || !password || !email || !role_id) {
                    failedUsers.push({
                        row: row,
                        error: "username, password, email dan role_id wajib"
                    });
                    continue;
                }
                const role = await Role.findByPk(role_id);
                if (!role) {
                    failedUsers.push({
                        row,
                        error: "role_id tidak valid"
                    });
                    continue;
                }
                const exists = await User.findOne({
                    where: {
                        [Op.or]: [
                            { username },
                            { email }
                        ]
                    }
                });

                if (exists) {
                    failedUsers.push({
                        row,
                        error: "Username atau email sudah digunakan"
                    });
                    continue;
                }

                const hashed = await bcrypt.hash(String(password), 10);
                const newUser = await User.create({
                    username,
                    email,
                    password: hashed,
                    full_name,
                    parent_email,
                    parent_contact,
                    role_id,
                    class_id,
                    status
                });

                createdUsers.push(newUser);
            } catch (err) {
                failedUsers.push({
                    row,
                    error: err.message
                });
            }
        }

        return res.json({
            success: true,
            created: createdUsers.length,
            failed: failedUsers.length,
            createdUsers,
            failedUsers
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
const DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        await User.destroy({ where: { id } });

        return res.json({
            success: true,
            message: "User berhasil dihapus"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = { register, login, GetUser, GetMyData, UpdateUser, GenerateUserExcel, DeleteUser };
