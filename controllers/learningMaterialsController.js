const { LearningMaterials, Teacher, Class, User, Role, Students, TeacherClass, Subject } = require("../models");
const { Op } = require("sequelize");

const getAllLearningMaterials = async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || "";

        const userData = await User.findOne({
            where: { id: userId },
            attributes: ["id", "username", "email", "class_id"]
        });

        // =====================
        //         SISWA
        // =====================
        if (role.role_name === "Siswa") {

            if (!userData.class_id) {
                return res.status(400).json({
                    success: false,
                    message: "Siswa belum memiliki class_id"
                });
            }

            const whereCondition = {
                class_id: userData.class_id,
                title: { [Op.like]: `%${search}%` }
            };

            const { rows, count } = await LearningMaterials.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: Teacher,
                        as: "teacher",
                        attributes: ["subject_type"],
                        include: [
                            { model: User, attributes: ["id", "username", "email", "class_id"] },
                            { model: Subject, attributes: ["subject_name"] }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]],
                limit,
                offset
            });

            return res.json({
                success: true,
                role,
                message: "Berhasil mengambil learning materials kelas Anda",
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                },
                data: rows
            });
        }
        if (role.role_name === "Guru") {
            const teacherRecords = await Teacher.findAll({
                where: { user_id: userId }
            });
            const teacherIds = teacherRecords.map(t => t.id);
            const whereCondition = {
                teacher_id: { [Op.in]: teacherIds },
                title: { [Op.like]: `%${search}%` }
            };
            const { rows, count } = await LearningMaterials.findAndCountAll({
                include: [
                    {
                        model: Teacher,
                        as: "teacher",
                        where: { user_id: userId },
                        attributes: ["id", "subject_type"],
                        include: [{ model: User, attributes: ["id", "username", "email"] }]
                    }
                ],
                where: {
                    title: { [Op.like]: `%${search}%` }
                },
                order: [["createdAt", "DESC"]],
                limit,
                offset
            });


            return res.json({
                success: true,
                role,
                message: "Berhasil mengambil learning materials Anda",
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                },
                data: rows
            });
        }
        const { rows, count } = await LearningMaterials.findAndCountAll({
            where: {
                title: { [Op.like]: `%${search}%` }
            },
            include: [
                {
                    model: Teacher,
                    as: "teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"],
                            include: [{ model: Role, attributes: ["role_name"] }]
                        }
                    ]
                }
            ],
            order: [["id", "DESC"]],
            limit,
            offset
        });

        res.json({
            success: true,
            role,
            message: "Berhasil mengambil semua learning materials",
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
                where: { user_id: userId, class_id: classId }
            });
            canAccess = !!teacher;
        } else if (userRole === "Siswa") {
            const student = await Students.findOne({
                where: { user_id: userId, class_id: classId }
            });
            canAccess = !!student;
        } else if (userRole === "Admin") {
            canAccess = true;
        }

        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke kelas ini"
            });
        }

        let whereCondition = {};

        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({
                where: { user_id: userId, class_id: classId }
            });
            whereCondition.teacher_id = teacher.id;
        }

        const materials = await LearningMaterials.findAll({
            where: whereCondition,
            include: [
                {
                    model: Teacher,
                    as: "teacher",
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
                    model: Teacher,
                    as: "teacher",
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"]
                        }
                    ]
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
        console.error("Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createLearningMaterial = async (req, res) => {
    try {
        const userId = req.user.id;
        const { class_id, teacher_id, url_material, title, description } = req.body;
        if (!teacher_id || !url_material || !title) {
            return res.status(400).json({
                success: false,
                message: "Field 'teacher_id', 'url_material', dan 'title' wajib diisi."
            });
        }
        const teacher = await Teacher.findOne({
            where: { id: teacher_id }
        });
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Guru tidak ditemukan"
            });
        }
        const data = await LearningMaterials.create({
            user_id: userId,
            teacher_id,
            url_material,
            title,
            class_id,
            description
        });
        res.json({
            success: true,
            message: "Learning material berhasil dibuat",
            data
        });
    } catch (error) {
        console.error("Error creating learning material:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan server saat membuat materi pembelajaran."
        });
    }
};

const createLearningMaterialGuru = async (req, res) => {
    try {
        const userId = req.user.id;
        const { class_id, teacher_id, url_material, title, description } = req.body;
        if (!title || !teacher_id || !url_material || !class_id) {
            return res.status(400).json({
                success: false,
                message: "Field 'title', 'teacher_id', dan 'url_material' wajib diisi."
            });
        }
        const targetTeacher = await Teacher.findOne({
            where: teacher_id
        });
        if (!targetTeacher) {
            return res.status(404).json({
                success: false,
                message: "Kelas Pelajaran tidak ditemukan."
            });
        }
        const data = await LearningMaterials.create({
            user_id: userId,
            class_id,
            teacher_id,
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
            message: error.message || "Terjadi kesalahan server."
        });
    }
};

const updateLearningMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { role } = req.user;
        const { title, description, url_material, class_id } = req.body;

        const material = await LearningMaterials.findOne({
            where: { id },
            include: [{ model: Teacher, as: "teacher" }]
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Learning material tidak ditemukan"
            });
        }
        if (role.role_name === "Admin") {
            await material.update({
                title: title || material.title,
                description: description || material.description,
                url_material: url_material || material.url_material,
                class_id: class_id || material.class_id
            });
            return res.json({
                success: true,
                message: "Learning material berhasil diperbarui",
                data: material
            });
        }
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (!teacher || material.teacher.id !== teacher.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin untuk mengedit materi ini"
            });
        }

        await material.update({
            title: title || material.title,
            description: description || material.description,
            url_material: url_material || material.url_material,
            class_id: class_id || material.class_id
        });

        res.json({
            success: true,
            message: "Learning material berhasil diperbarui",
            data: material
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
        const { role } = req.user;

        const material = await LearningMaterials.findOne({
            where: { id },
            include: [
                {
                    model: Teacher,
                    as: "teacher",
                    attributes: ["id", "user_id"]
                }
            ]
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Learning material tidak ditemukan"
            });
        }

        // Admin boleh hapus apa saja
        if (role.role_name === "Admin") {
            await material.destroy();
            return res.json({
                success: true,
                message: "Learning material berhasil dihapus"
            });
        }

        // Ambil teacher milik user login
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (!teacher) {
            return res.status(403).json({
                success: false,
                message: "Role Anda bukan guru"
            });
        }

        // Cek kepemilikan berdasarkan user — paling aman
        if (material.teacher.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin untuk menghapus materi ini"
            });
        }

        await material.destroy();

        return res.json({
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
        const checkUser = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    as: "role",
                    attributes: ["role_name"]
                }
            ]
        });

        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }

        const roleName = checkUser.role?.role_name;

        if (roleName !== "Guru") {
            return res.status(403).json({
                success: false,
                message: "Hanya guru yang dapat mengakses materi pembelajaran mereka"
            });
        }
        const teacher = await Teacher.findOne({
            where: { user_id: userId }
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Data guru tidak ditemukan"
            });
        }
        const data = await LearningMaterials.findAll({
            where: { teacher_id: teacher.id },
            include: [
                {
                    model: Teacher,
                    as: "teacher",
                    attributes: ["id", "subject_type"],
                    include: [
                        {
                            model: User,
                            attributes: ["id", "username", "email"]
                        }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json({
            success: true,
            message: "Berhasil mengambil learning materials Anda",
            data
        });
    } catch (error) {
        console.error("Error fetching my learning materials:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Terjadi kesalahan server"
        });
    }
};

const getMyLearningMaterialsStudent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role } = req.user
        const student = await Students.findOne({
            where: { user_id: userId }
        });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Anda tidak terdaftar sebagai Siswa"
            });
        }
        const teachers = await Teacher.findAll({
            include: [
                {
                    model: Class,
                    as: "Classes",
                    where: { id: student.class_id },
                    attributes: ["id", "class_name"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!teachers || teachers.length === 0) {
            return res.json({
                success: true,
                message: "Tidak ada materi di kelas ini",
                data: []
            });
        }

        const teacherIds = teachers.map(t => t.id);
        const data = await LearningMaterials.findAll({
            where: {
                class_id: student.class_id
            },
            include: [
                {
                    model: Teacher,
                    attributes: ["subject_type"],
                    as: "teacher",
                    include: [
                        { model: User, attributes: ["id", "username", "email"] },
                        { model: Subject, attributes: ["subject_name"] }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json({
            success: true,
            role: role.role_name,
            message: "Berhasil mengambil learning materials kelas Anda",
            data
        });

    } catch (error) {
        console.error("Error fetching student learning materials:", error);
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