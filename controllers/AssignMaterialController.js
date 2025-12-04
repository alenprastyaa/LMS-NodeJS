const { LearningMaterials, Teacher, Subject } = require("../models");
const Assign = require("../models/AssignMaterials");
const { Op } = require('sequelize')
const User = require("../models/User")

const CreateAssign = async (req, res) => {
    try {
        const userId = req.user.id;
        const { material_id, description, url_assign } = req.body;
        if (!material_id || !description || !url_assign) {
            return res.status(400).json({
                success: false,
                message: "Wajib isis Semua field"
            });
        }
        const checkMaterial = await LearningMaterials.findByPk(material_id);
        if (!checkMaterial) {
            return res.status(404).json({
                success: false,
                message: "material_id tidak ditemukan"
            });
        }
        const existing = await Assign.findOne({
            where: {
                user_id: userId,
                material_id
            }
        });

        if (existing) {
            return res.status(404).json({
                success: false,
                message: "Anda sudah mengerjakan tugas ini"
            });
        }
        const data = await Assign.create({
            user_id: userId,
            material_id,
            description: description,
            url_assign
        });

        res.json({
            success: true,
            message: "Tugas berhasil dibuat",
            data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
const GetAllAssign = async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";

        let whereCondition = {
            description: { [Op.like]: `%${search}%` }
        };

        let includeClause = [
            {
                model: LearningMaterials,
                attributes: ["id", "title"],
                include: [
                    {
                        model: Teacher,
                        as: "teacher",
                        attributes: ["id", "user_id", "subject_type"],
                        include: [
                            {
                                model: Subject,
                                attributes: ["subject_name"]
                            },
                            {
                                model: User,
                                attributes: ["username", "id"]
                            }
                        ]
                    }
                ]
            }
        ];

        // Handle role-based filtering
        if (role.role_name === "Guru") {
            // Get ALL teachers untuk user ini (bisa punya multiple subjects)
            const teachers = await Teacher.findAll({
                where: { user_id: userId }
            });

            if (teachers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Data guru tidak ditemukan untuk user ini."
                });
            }

            const teacherIds = teachers.map(t => t.id);

            // Get all material_ids yang dibuat oleh semua teacher records ini
            const materials = await LearningMaterials.findAll({
                where: { teacher_id: { [Op.in]: teacherIds } },
                attributes: ["id"]
            });

            const materialIds = materials.map(m => m.id);

            if (materialIds.length === 0) {
                return res.json({
                    success: true,
                    role: role.role_name,
                    message: "Belum ada materi yang dibuat",
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    },
                    data: []
                });
            }

            // Filter assignments berdasarkan material_ids
            whereCondition.material_id = { [Op.in]: materialIds };

        } else if (role.role_name === "Siswa") {
            whereCondition.user_id = userId;
        }
        // Admin dapat mengakses semua data tanpa filter tambahan

        // Fetch data with pagination
        const { rows, count } = await Assign.findAndCountAll({
            where: whereCondition,
            include: includeClause,
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true
        });

        res.json({
            success: true,
            role: role.role_name,
            message: "Berhasil mengambil data assign",
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            },
            data: rows
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const GetAssignByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await Assign.findAll({
            where: { user_id: userId }
        });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const UpdateAssign = async (req, res) => {
    try {
        const { id } = req.params;
        const { material_id, description, url_assign, title } = req.body;
        const assign = await Assign.findByPk(id);
        if (!assign) {
            return res.status(404).json({
                success: false,
                message: "Data tidak ditemukan"
            });
        }
        if (material_id !== undefined) assign.material_id = material_id;
        if (description !== undefined) assign.description = description;
        if (url_assign !== undefined) assign.url_assign = url_assign;
        if (title !== undefined) assign.title = title;

        await assign.save();

        res.json({
            success: true,
            message: "Data berhasil diperbarui",
            data: assign,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
            error: error.message
        });
    }
};


const DeleteAssign = async (req, res) => {
    try {
        const { id } = req.params;

        const assign = await Assign.findByPk(id);
        if (!assign) {
            return res.status(404).json({
                success: false,
                message: "Data tidak ditemukan"
            });
        }

        await assign.destroy();
        res.json({ success: true, message: "Berhasil dihapus" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    CreateAssign,
    GetAllAssign,
    GetAssignByUser,
    UpdateAssign,
    DeleteAssign
};
