const { Teacher } = require("../models");
const Subject = require("../models/SubjectModel");
const { Op } = require("sequelize");

const GetSubjects = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = ""
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const where = {};

        // SEARCH by subject_name
        if (search) {
            where.subject_name = { [Op.like]: `%${search}%` };
        }

        const { rows, count } = await Subject.findAndCountAll({
            where,
            limit,
            offset,
            order: [["id", "DESC"]]
        });

        return res.status(200).json({
            status: 200,
            message: "Successfully fetched subjects",
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                total_pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};
const GetSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findOne({
            where: { id: req.params.id }
        });

        if (!subject) {
            return res.status(404).json({ status: 404, message: "Subject not found" });
        }

        res.status(200).json({
            status: 200,
            data: subject
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

const CreateSubject = async (req, res) => {
    try {
        const { subject_name } = req.body;

        const existing = await Subject.findOne({
            where: { subject_name }
        });

        if (existing) {
            return res.status(400).json({
                status: 400,
                message: "Nama Mata Pelajaran sudah tersedia"
            });
        }
        const subject = await Subject.create({ subject_name });
        res.status(201).json({
            status: 201,
            data: subject,
            message: "Subject created successfully"
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

const UpdateSubject = async (req, res) => {
    try {
        const subject = await Subject.update(req.body, {
            where: { id: req.params.id }
        });

        res.status(200).json({
            status: 200,
            message: "Subject updated successfully"
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

const DeleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        const teacherCount = await Teacher.count({
            where: { subject_type: subjectId }
        });

        if (teacherCount > 0) {
            return res.status(400).json({
                status: 400,
                message: "Subject tidak dapat dihapus karena masih digunakan oleh guru."
            });
        }
        await Subject.destroy({
            where: { id: subjectId }
        });

        res.status(200).json({
            status: 200,
            message: "Subject deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


module.exports = {
    GetSubjects,
    GetSubjectById,
    CreateSubject,
    UpdateSubject,
    DeleteSubject
};
