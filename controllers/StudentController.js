const Students = require("../models/Students");
const User = require("../models/User");
const Class = require("../models/Class");
const Role = require("../models/Role");
const { Op } = require("sequelize");

const createStudent = async (req, res) => {
    try {
        const { class_id, user_id, parent_email } = req.body;
        if (!class_id || !user_id || !parent_email) {
            return res.status(400).json({
                success: false,
                message: "class_id, user_id, dan parent_email wajib diisi"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parent_email)) {
            return res.status(400).json({
                success: false,
                message: "Format parent_email tidak valid"
            });
        }
        const classExists = await Class.findByPk(class_id);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Class tidak ditemukan"
            });
        }
        const userExists = await User.findByPk(user_id, {
            include: [{
                model: Role,
                as: "role"
            }]
        });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        if (userExists.role.role_name != "Siswa") {
            return res.json({ "message": "User Tersebut Bukan Siswa" })
        }
        const studentExists = await Students.findOne({ where: { user_id } });
        if (studentExists) {
            return res.status(409).json({
                success: false,
                message: "Siswa sudah terdaftar"
            });
        }
        const student = await Students.create({
            class_id,
            user_id,
            parent_email
        });

        return res.status(201).json({
            success: true,
            message: "Siswa berhasil ditambahkan",
            data: student
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            class_id
        } = req.query;

        const offset = (page - 1) * limit;

        const where = {};
        if (class_id) {
            where.class_id = class_id;
        }
        if (search) {
            where[Op.or] = [
                { '$user.username$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } },
                { '$class.class_name$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows, count } = await Students.findAndCountAll({
            where,
            include: [
                { model: User, attributes: ["id", "username", "email"] },
                { model: Class, attributes: ["id", "class_name"] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["id", "DESC"]],
            distinct: true
        });

        const result = rows.map(s => ({
            id: s.id,
            user_id: s.user.id,
            username: s.user.username,
            email: s.user.email,
            class_id: s.class.id,
            class_name: s.class.class_name,
            parent_email: s.parent_email
        }));

        return res.status(200).json({
            success: true,
            message: "Data siswa berhasil diambil",
            data: result,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }

        const s = await Students.findByPk(id, {
            include: [
                { model: User, attributes: ["id", "username", "email"] },
                { model: Class, attributes: ["id", "class_name"] }
            ]
        });

        if (!s) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }

        const result = {
            id: s.id,
            user_id: s.user.id,
            username: s.user.username,
            email: s.user.email,
            class_id: s.class.id,
            class_name: s.class.class_name,
            parent_email: s.parent_email
        };

        return res.status(200).json({
            success: true,
            message: "Data siswa berhasil diambil",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getStudentsByClass = async (req, res) => {
    try {
        const { class_id } = req.params;

        if (!class_id || isNaN(class_id)) {
            return res.status(400).json({
                success: false,
                message: "class_id harus berupa angka"
            });
        }

        const classExists = await Class.findByPk(class_id);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: "Class tidak ditemukan"
            });
        }

        const students = await Students.findAll({
            where: { class_id },
            include: [
                { model: User, attributes: ["id", "username", "email"] }
            ]
        });

        const result = students.map(s => ({
            id: s.id,
            user_id: s.user.id,
            username: s.user.username,
            email: s.user.email,
            class_id: classExists.id,
            class_name: classExists.class_name,
            parent_email: s.parent_email
        }));

        return res.status(200).json({
            success: true,
            message: "Data siswa berdasarkan class berhasil diambil",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_id, parent_email } = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }
        const student = await Students.findByPk(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }
        if (class_id) {
            if (isNaN(class_id)) {
                return res.status(400).json({
                    success: false,
                    message: "class_id harus berupa angka"
                });
            }

            const classExists = await Class.findByPk(class_id);
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: "Class tidak ditemukan"
                });
            }
        }
        if (parent_email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(parent_email)) {
                return res.status(400).json({
                    success: false,
                    message: "Format parent_email tidak valid"
                });
            }
        }

        await student.update({
            ...(class_id && { class_id }),
            ...(parent_email && { parent_email })
        });

        return res.status(200).json({
            success: true,
            message: "Siswa berhasil diperbarui",
            data: student
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }

        const student = await Students.findByPk(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan"
            });
        }

        await student.destroy();

        return res.status(200).json({
            success: true,
            message: "Siswa berhasil dihapus",
            data: student
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentsByClass,
    updateStudent,
    deleteStudent
};