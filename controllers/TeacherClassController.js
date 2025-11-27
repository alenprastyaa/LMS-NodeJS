const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const TeacherClass = require("../models/TeacherClass");
const User = require("../models/User");

const assignTeacherToClass = async (req, res) => {
    try {
        const { teacher_id, class_id } = req.body;
        const teacher = await Teacher.findByPk(teacher_id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Guru tidak ditemukan" });
        }
        const kelas = await Class.findByPk(class_id);
        if (!kelas) {
            return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
        }
        const existing = await TeacherClass.findOne({ where: { teacher_id, class_id } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Guru sudah mengajar kelas ini" });
        }

        await TeacherClass.create({ teacher_id, class_id });

        res.json({
            success: true,
            message: "Guru berhasil ditambahkan ke kelas",
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

const removeTeacherFromClass = async (req, res) => {
    try {
        const { teacher_id, class_id } = req.body;

        const record = await TeacherClass.findOne({ where: { teacher_id, class_id } });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Guru tidak ditemukan di kelas tersebut"
            });
        }

        await record.destroy();

        res.json({
            success: true,
            message: "Guru berhasil dihapus dari kelas"
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

const getTeachersByClass = async (req, res) => {
    try {
        const { class_id } = req.params;

        const kelas = await Class.findOne({
            where: { id: class_id },
            include: [
                {
                    model: Teacher,
                    as: "Teachers",
                    attributes: ["subject_type"],
                    include: [
                        {
                            model: User,
                            attributes: ["username"]
                        }
                    ]
                }
            ]
        });

        if (!kelas) {
            return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });
        }

        res.json({
            success: true,
            class: kelas.class_name,
            teachers: kelas.Teachers
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

const getClassesByTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;

        const teacher = await Teacher.findOne({
            where: { id: teacher_id },
            attributes: ["id", "subject_type"],
            include: [
                {
                    model: Class,
                    as: "Classes",
                    attributes: ["id", "class_name"]
                }
            ]
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Guru tidak ditemukan" });
        }

        res.json({
            success: true,
            subject_type: teacher.subject_type,
            classes: teacher.Classes
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};

const getAllTeacherClass = async (req, res) => {
    try {
        const data = await TeacherClass.findAll({

        });
        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};


module.exports = {
    assignTeacherToClass,
    removeTeacherFromClass,
    getTeachersByClass,
    getClassesByTeacher,
    getAllTeacherClass
};
