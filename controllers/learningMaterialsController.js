const { LearningMaterials, Teacher, Class, User, Role, Students, Assign } = require("../models");

const getAllLearningMaterials = async (req, res) => {
    try {
        const data = await LearningMaterials.findAll({
            include: [
                {
                    model: Teacher,
                    as: "Teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"],
                            include: [
                                {
                                    model: Role,
                                    attributes: ["role_name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Class,
                    as: "Class",
                    attributes: ["id", "class_name"]
                }
            ],
            order: [["id", "DESC"]]
        });

        res.json({
            success: true,
            message: "Berhasil mengambil semua learning materials",
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLearningMaterialsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;
        const classData = await Class.findOne({
            where: { id: classId }
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Kelas tidak ditemukan"
            });
        }

        let canAccess = false;
        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({
                where: { user_id: userId }
            });
            if (teacher) {
                const materialsInClass = await LearningMaterials.count({
                    where: {
                        class_id: classId,
                        teacher_id: teacher.id
                    }
                });
                if (materialsInClass > 0) {
                    canAccess = true;
                }
            }
        } else if (userRole === "Siswa") {
            const student = await Students.findOne({
                where: { user_id: userId }
            });

            if (student && student.class_id == classId) {
                canAccess = true;
            }
        } else if (userRole === "Admin") {
            canAccess = true;
        }
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke kelas ini"
            });
        }
        let whereCondition = { class_id: classId };
        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            whereCondition.teacher_id = teacher.id;
        }

        const materials = await LearningMaterials.findAll({
            where: whereCondition,
            include: [
                {
                    model: Assign,
                    as: "assign_materials",
                    attributes: ["id", "user_id", "url_assign", "description", "createdAt"]
                },
                {
                    model: Teacher,
                    as: "Teacher",
                    attributes: ["id", "subject_type"],
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"],
                            include: [
                                {
                                    model: Role,
                                    attributes: ["role_name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Class,
                    as: "Class",
                    attributes: ["id", "class_name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json({
            success: true,
            message: "Berhasil mengambil learning materials kelas",
            data: materials
        });
    } catch (error) {
        console.error("Error fetching learning materials by class:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan server"
        });
    }
};

const getLearningMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await LearningMaterials.findOne({
            where: { id },
            include: [
                {
                    model: Assign,
                    as: "assign_materials"
                },
                {
                    model: Teacher,
                    as: "Teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"]
                        }
                    ]
                },
                {
                    model: Class,
                    as: "Class",
                    attributes: ["id", "class_name"]
                }
            ]
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Learning material tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Berhasil mengambil learning material",
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createLearningMaterial = async (req, res) => {
    try {
        const { teacher_id, class_id, url_material, title, description } = req.body;
        if (!teacher_id || !class_id || !url_material || !title) {
            return res.status(400).json({
                success: false,
                message: "Field 'teacher_id', 'class_id', 'url_material', dan 'title' wajib diisi."
            });
        }

        const data = await LearningMaterials.create({
            teacher_id,
            class_id,
            url_material,
            title,
            description
        });

        res.json({
            success: true,
            message: "Learning material berhasil dibuat",
            data
        });
    } catch (error) {
        console.error("Error creating learning material (Admin):", error);
        res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan server saat membuat materi pembelajaran."
        });
    }
};

const createLearningMaterialGuru = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Akun ini tidak terdaftar sebagai Guru"
            });
        }

        const { class_id, url_material, title, description } = req.body;

        if (!title || !class_id || !url_material) {
            return res.status(400).json({
                success: false,
                message: "Field 'title', 'class_id', dan 'url_material' wajib diisi."
            });
        }

        // Validasi class ada
        const classData = await Class.findOne({ where: { id: class_id } });
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: "Kelas tidak ditemukan"
            });
        }

        const data = await LearningMaterials.create({
            teacher_id: teacher.id,
            class_id,
            url_material,
            title,
            description
        });

        res.json({
            success: true,
            message: "Learning material berhasil dibuat",
            data
        });
    } catch (error) {
        console.error("Error creating learning material for guru:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan server saat membuat materi pembelajaran."
        });
    }
};

const updateLearningMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, description, url_material } = req.body;

        const check = await LearningMaterials.findOne({ where: { id } });
        if (!check) {
            return res.status(404).json({
                success: false,
                message: "Learning material tidak ditemukan"
            });
        }

        // Validasi: guru hanya bisa edit materi miliknya sendiri
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (teacher && check.teacher_id !== teacher.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin untuk mengedit materi ini"
            });
        }

        await check.update({
            title: title || check.title,
            description: description || check.description,
            url_material: url_material || check.url_material
        });

        res.json({
            success: true,
            message: "Learning material berhasil diperbarui",
            data: check
        });
    } catch (error) {
        console.error("Error updating learning material:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteLearningMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const check = await LearningMaterials.findOne({ where: { id } });
        if (!check) {
            return res.status(404).json({
                success: false,
                message: "Learning material tidak ditemukan"
            });
        }

        // Validasi: guru hanya bisa delete materi miliknya sendiri
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (teacher && check.teacher_id !== teacher.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin untuk menghapus materi ini"
            });
        }

        await check.destroy();

        res.json({
            success: true,
            message: "Learning material berhasil dihapus"
        });
    } catch (error) {
        console.error("Error deleting learning material:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyLearningMaterials = async (req, res) => {
    try {
        const userId = req.user.id;

        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Akun ini tidak terdaftar sebagai Guru"
            });
        }

        const data = await LearningMaterials.findAll({
            where: { teacher_id: teacher.id },
            include: [
                {
                    model: Assign,
                    as: "assign_materials"
                },
                {
                    model: Teacher,
                    as: "Teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"],
                            include: [
                                {
                                    model: Role,
                                    attributes: ["role_name"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Class,
                    as: "Class"
                }
            ],
            order: [["id", "DESC"]]
        });

        res.json({
            success: true,
            message: "Berhasil mengambil learning materials Anda",
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyLearningMaterialsStudent = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await Students.findOne({
            where: { user_id: userId }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Akun ini tidak terdaftar sebagai Siswa"
            });
        }

        const data = await LearningMaterials.findAll({
            where: { class_id: student.class_id },
            include: [
                {
                    model: Assign,
                    as: "assign_materials"
                },
                {
                    model: Teacher,
                    as: "Teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"]
                        }
                    ]
                },
                {
                    model: Class,
                    as: "Class",
                    attributes: ["id", "class_name"]
                }
            ],
            order: [["id", "DESC"]]
        });

        res.json({
            success: true,
            message: "Berhasil mengambil learning materials kelas Anda",
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllLearningMaterials,
    getLearningMaterialById,
    createLearningMaterial,
    updateLearningMaterial,
    deleteLearningMaterial,
    createLearningMaterialGuru,
    getMyLearningMaterials,
    getMyLearningMaterialsStudent,
    getLearningMaterialsByClass
};