const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const TeacherClass = require("../models/TeacherClass");
const User = require("../models/User");
const { Subject } = require("../models");

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
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "User tidak ditemukan. Silakan login terlebih dahulu."
            });
        }

        const userId = req.user.id;
        const role = req.user.role;

        if (!role) {
            return res.status(403).json({
                success: false,
                error: "Role tidak ditemukan."
            });
        }

        //  ===================  UNTUK GURU  ===================
        if (role.role_name === "Guru") {
            const teachers = await Teacher.findAll({
                where: { user_id: userId },
                include: [
                    { model: User, attributes: ["id", "username", "email"] },
                    { model: Subject, attributes: ["id", "subject_name"] },
                    {
                        model: Class,
                        as: "Classes",
                        attributes: ["id", "class_name"],
                        through: { attributes: [] }
                    }
                ],
                order: [["id", "DESC"]]
            });

            if (!teachers || teachers.length === 0) {
                return res.json({
                    success: true,
                    message: "Data guru tidak ditemukan.",
                    data: []
                });
            }

            const formatted = teachers.map(t => ({
                id: t.id,
                user_id: t.user?.id,
                username: t.user?.username,
                email: t.user?.email,
                subject_type: t.subject_type,
                subject_name: t.subject?.subject_name || null,
                classes: t.Classes?.map(c => ({
                    id: c.id,
                    class_name: c.class_name
                })) || []
            }));

            return res.json({
                success: true,
                data: formatted
            });
        }

        //  ===================  UNTUK ADMIN — FORMAT DISAMAKAN  ===================
        const teachers = await Teacher.findAll({
            include: [
                { model: User, attributes: ["id", "username", "email"] },
                { model: Subject, attributes: ["id", "subject_name"] },
                {
                    model: Class,
                    as: "Classes",
                    attributes: ["id", "class_name"],
                    through: { attributes: [] }
                }
            ],
            order: [["id", "DESC"]]
        });

        const formatted = teachers.map(t => ({
            id: t.id,
            user_id: t.user?.id,
            username: t.user?.username,
            email: t.user?.email,
            subject_type: t.subject_type,
            subject_name: t.subject?.subject_name || null,
            classes: t.Classes?.map(c => ({
                id: c.id,
                class_name: c.class_name
            })) || []
        }));

        return res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        console.error("Error in getAllTeacherClass:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};

module.exports = {
    assignTeacherToClass,
    removeTeacherFromClass,
    getTeachersByClass,
    getClassesByTeacher,
    getAllTeacherClass
};
