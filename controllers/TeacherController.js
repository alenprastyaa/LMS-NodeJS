const { Teacher, User, Class } = require("../models");
const Subject = require("../models/SubjectModel");
const Role = require("../models/Role");

const createTeacher = async (req, res) => {
    try {
        const { user_id, subject_type } = req.body;
        const checkUser = await User.findByPk(user_id, {
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["role_name"]
                }
            ]
        });
        if (!checkUser) {
            return res.status(400).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        const roleName = checkUser.role?.role_name;
        if (roleName !== "Guru") {
            return res.status(400).json({
                success: false,
                message: "User bukanlah guru"
            });
        }
        const checkSubject = await Subject.findByPk(subject_type);
        if (!checkSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject tidak ditemukan"
            });
        }

        const existing = await Teacher.findOne({
            where: { user_id, subject_type }
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Mata Pelajaran sudah terdaftar untuk guru ini"
            });
        }
        const newTeacher = await Teacher.create({
            user_id,
            subject_type
        });
        return res.json({
            success: true,
            message: "Teacher berhasil dibuat",
            data: newTeacher
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getAllTeachers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "User tidak ditemukan. Silakan login terlebih dahulu."
            });
        }
        const userId = req.user.id;
        const roleName = req.user.role?.role_name;
        if (!roleName) {
            return res.status(403).json({
                success: false,
                error: "Role tidak ditemukan."
            });
        }
        let queryOptions = {
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "email"]
                },
                {
                    model: Subject,
                    attributes: ["id", "subject_name"]
                },
                {
                    model: Class,
                    as: "Classes",
                    attributes: ["id", "class_name"],
                    through: { attributes: [] }
                }
            ],
            order: [["id", "DESC"]]
        };
        if (roleName === "Guru") {
            queryOptions.where = { user_id: userId };
        }
        const teachers = await Teacher.findAll(queryOptions);
        if (!teachers || teachers.length === 0) {
            return res.status(200).json({
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

    } catch (error) {
        console.error("Error in getAllTeachers:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;

        const t = await Teacher.findOne({
            where: { id },
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "email"]
                },
                {
                    model: Class,
                    as: "Classes",
                    attributes: ["id", "class_name"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!t) {
            return res.status(404).json({
                success: false,
                message: "Teacher tidak ditemukan"
            });
        }

        const formatted = {
            id: t.id,
            user_id: t.user?.id,
            username: t.user?.username,
            email: t.user?.email,
            subject_type: t.subject_type,
            classes: t.Classes?.map(c => ({
                id: c.id,
                class_name: c.class_name
            })) || []
        };

        return res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const getMyTeacher = async (req, res) => {
    try {
        const user_id = req.user.id;
        const teachers = await Teacher.findAll({
            where: { user_id },
            include: [
                {
                    model: User,
                    attributes: ["id", "username", "email",]
                },
                {
                    model: Subject,
                    attributes: ["id", "subject_name"]
                },
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
            return res.status(404).json({
                success: false,
                message: "Data guru tidak ditemukan untuk user ini"
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

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, subject_type } = req.body;

        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher tidak ditemukan"
            });
        }
        if (user_id) {
            const checkUser = await User.findByPk(user_id);
            if (!checkUser) {
                return res.status(400).json({
                    success: false,
                    message: "User tidak ditemukan"
                });
            }
        }

        await teacher.update({
            user_id: user_id || teacher.user_id,
            subject_type: subject_type || teacher.subject_type
        });

        return res.json({
            success: true,
            message: "Teacher berhasil diupdate",
            data: teacher
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findByPk(id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher tidak ditemukan"
            });
        }

        await teacher.destroy();

        return res.json({
            success: true,
            message: "Teacher berhasil dihapus"
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacher
};
