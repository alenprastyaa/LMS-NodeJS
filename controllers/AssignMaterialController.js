const { LearningMaterials } = require("../models");
const Assign = require("../models/AssignMaterials");
const { Op } = require('sequelize')

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

        if (role.role_name === "Guru") {
            whereCondition.user_id = userId;
        }
        if (role.role_name === "Siswa") {
            whereCondition.user_id = userId;
        }

        const { rows, count } = await Assign.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: LearningMaterials,
                    attributes: ["id", "title"]
                }
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset
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
