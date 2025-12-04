const { DiscussionForum, Class, Teacher, User, DiscussionPost, Students, TeacherClass, LearningMaterials } = require("../models");

const createDiscussion = async (req, res) => {
    try {
        const userId = req.user.id;
        const { class_id, title, description } = req.body;
        const teacher = await Teacher.findOne({ where: { user_id: userId } });
        if (!teacher) {
            return res.status(403).json({
                success: false,
                message: "Akun ini tidak terdaftar sebagai Guru"
            });
        }
        const teacherClass = await TeacherClass.findOne({
            where: {
                teacher_id: teacher.id,
                class_id: class_id
            }
        });

        if (!teacherClass) {
            return res.status(403).json({
                success: false,
                message: "Guru tidak mengajar kelas ini"
            });
        }
        const newDiscussion = await DiscussionForum.create({
            class_id,
            teacher_class_id: teacherClass.id,
            title,
            description
        });

        const discussionWithDetails = await DiscussionForum.findOne({
            where: { id: newDiscussion.id },
            include: [
                { model: Class, attributes: ["class_name"] },
                {
                    model: TeacherClass,
                    include: [
                        {
                            model: Teacher,
                            attributes: ["id", "subject_type"],
                            include: [{ model: User, attributes: ["full_name", "username"] }]
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Diskusi berhasil dibuat",
            data: discussionWithDetails
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};


const getDiscussionsByMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;

        const material = await LearningMaterials.findOne({
            where: { id: materialId },
            include: [{ model: Class, attributes: ['id', 'class_name'] }]
        });

        if (!material) {
            return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
        }

        // Access control
        let canAccess = false;

        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher && teacher.id === material.teacher_id) canAccess = true;
        }

        if (userRole === "Siswa") {
            const student = await Students.findOne({ where: { user_id: userId } });
            if (student && student.class_id === material.class_id) canAccess = true;
        }

        if (userRole === "Admin") canAccess = true;

        if (!canAccess) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki akses" });
        }

        const discussions = await DiscussionForum.findAll({
            where: { material_id: materialId },
            include: [
                { model: LearningMaterials },
                { model: Class },
                {
                    model: TeacherClass,
                    include: [
                        {
                            model: Teacher,
                            include: [{ model: User }]
                        }
                    ]
                },
                {
                    model: DiscussionPost,
                    as: "discussion_posts",
                    include: [{ model: User }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            message: "Data berhasil diambil",
            data: discussions
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const getDiscussionsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;
        const role = req.user.role.role_name;

        let canAccess = false;

        if (role === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            const teacherClass = await TeacherClass.findOne({
                where: { teacher_id: teacher.id, class_id: classId }
            });

            if (teacherClass) canAccess = true;
        }

        if (role === "Siswa") {
            const student = await Students.findOne({ where: { user_id: userId } });
            if (student && student.class_id == classId) canAccess = true;
        }

        if (role === "Admin") canAccess = true;

        if (!canAccess) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki akses" });
        }

        const data = await DiscussionForum.findAll({
            where: { class_id: classId },
            include: [
                { model: Class },
                { model: LearningMaterials },
                {
                    model: TeacherClass,
                    include: [
                        {
                            model: Teacher,
                            include: [{ model: User }]
                        }
                    ]
                },
                {
                    model: DiscussionPost,
                    as: "discussion_posts",
                    include: [{ model: User }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, data });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getDiscussionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;

        const discussion = await DiscussionForum.findByPk(id, {
            include: [
                {
                    model: LearningMaterials,
                    attributes: ['id', 'title', 'description', 'url_material']
                },
                {
                    model: Teacher,
                    attributes: ['id', 'subject_type'],
                    include: [{ model: User, attributes: ['username', 'full_name'] }]
                },
                {
                    model: Class,
                    attributes: ['id', 'class_name']
                },
                {
                    model: DiscussionPost,
                    as: 'discussion_posts',
                    attributes: ['id', 'content', 'created_at'],
                    include: [{ model: User, attributes: ['username', 'full_name'] }],
                    order: [['created_at', 'ASC']]
                }
            ]
        });

        if (!discussion) {
            return res.status(404).json({ success: false, message: "Diskusi tidak ditemukan" });
        }

        let canAccess = false;
        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher && discussion.teacher_id === teacher.id) {
                canAccess = true;
            }
        } else if (userRole === "Siswa") {
            const student = await Students.findOne({ where: { user_id: userId } });
            if (student && student.class_id === discussion.class_id) {
                canAccess = true;
            }
        } else if (userRole === "Admin") {
            canAccess = true;
        }

        if (!canAccess) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke diskusi ini" });
        }

        res.json({
            success: true,
            message: "Diskusi berhasil diambil",
            data: discussion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const updateDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const discussion = await DiscussionForum.findByPk(id);
        if (!discussion) {
            return res.status(404).json({ success: false, message: "Diskusi tidak ditemukan" });
        }

        const teacher = await Teacher.findOne({ where: { user_id: userId } });
        if (!teacher || discussion.teacher_id !== teacher.id) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki izin untuk mengedit diskusi ini" });
        }

        const { title, description } = req.body;
        await discussion.update({ title, description });

        const updatedDiscussion = await DiscussionForum.findByPk(id, {
            include: [
                {
                    model: LearningMaterials,
                    attributes: ['id', 'title']
                },
                {
                    model: Teacher,
                    attributes: ['id'],
                    include: [{ model: User, attributes: ['username'] }]
                }
            ]
        });

        res.json({
            success: true,
            message: "Diskusi berhasil diperbarui",
            data: updatedDiscussion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const getMyDiscusion = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacher = await Teacher.findOne({ where: { user_id: userId } });

        if (!teacher) {
            return res.status(403).json({
                success: false,
                message: "Akun ini tidak terdaftar sebagai Guru"
            });
        }
        const discussions = await DiscussionForum.findAll({
            where: { teacher_id: teacher.id },
            order: [['created_at', 'DESC']],
            include: [{
                model: Class,
                attributes: ["class_name"]
            }]
        });

        res.status(200).json({
            success: true,
            data: discussions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};



const deleteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;

        const discussion = await DiscussionForum.findByPk(id);
        if (!discussion) {
            return res.status(404).json({ success: false, message: "Diskusi tidak ditemukan" });
        }

        let canDelete = false;
        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher && discussion.teacher_id === teacher.id) {
                canDelete = true;
            }
        } else if (userRole === "Admin") {
            canDelete = true;
        }

        if (!canDelete) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki izin untuk menghapus diskusi ini" });
        }

        await discussion.destroy();
        res.json({ success: true, message: "Diskusi berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
const getAllDiscussions = async (req, res) => {
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

        let discussions = [];

        const baseConfig = {
            include: [
                {
                    model: TeacherClass,
                    include: [
                        {
                            model: Teacher,
                            attributes: ["id", "subject_type"],
                            include: [{ model: User, attributes: ["username", "full_name"] }]
                        },
                        {
                            model: Class,
                            attributes: ["id", "class_name"]
                        }
                    ]
                },
                {
                    model: LearningMaterials,
                    attributes: ["id", "title", "description", "url_material"]
                },
                {
                    model: DiscussionPost,
                    as: "discussion_posts",
                    attributes: ["id", "content", "created_at"],
                    include: [{ model: User, attributes: ["username", "full_name"] }]
                }
            ],
            order: [
                ["created_at", "DESC"],
                [{ model: DiscussionPost, as: "discussion_posts" }, "created_at", "ASC"]
            ]
        };

        if (roleName === "Guru") {
            const teacher = await Teacher.findOne({
                where: { user_id: userId },
                include: [{ model: User, attributes: ["id", "username", "full_name"] }]
            });

            if (!teacher) {
                return res.status(403).json({
                    success: false,
                    message: "Akun ini tidak terdaftar sebagai Guru"
                });
            }

            baseConfig.include[0].where = { teacher_id: teacher.id };
            discussions = await DiscussionForum.findAll(baseConfig);
        } else if (roleName === "Siswa") {
            const student = await User.findOne({ where: { id: userId } });

            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: "Akun ini tidak terdaftar sebagai Siswa"
                });
            }

            baseConfig.include[0].include[1].where = { id: student.class_id };
            discussions = await DiscussionForum.findAll(baseConfig);
        } else if (roleName === "Admin") {
            discussions = await DiscussionForum.findAll(baseConfig);
        } else {
            return res.status(403).json({
                success: false,
                message: "Role tidak dikenali"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Diskusi berhasil diambil",
            data: discussions
        });
    } catch (error) {
        console.error("Error in getAllDiscussions:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal server error"
        });
    }
};
module.exports = {
    createDiscussion,
    getDiscussionsByMaterial,
    getDiscussionsByClass,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    getMyDiscusion,
    getAllDiscussions
};