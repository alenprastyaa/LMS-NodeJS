const { DiscussionForum, Class, Teacher, User, DiscussionPost, Students, TeacherClass, LearningMaterials } = require("../models");

const createDiscussion = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacher = await Teacher.findOne({ where: { user_id: userId } });

        if (!teacher) {
            return res.status(403).json({
                success: false,
                message: "Hanya Guru yang dapat membuat diskusi"
            });
        }
        const { material_id, title, description } = req.body;
        if (!material_id) {
            return res.status(400).json({
                success: false,
                message: "material_id is required"
            });
        }
        const material = await LearningMaterials.findOne({
            where: { id: material_id },
            include: [{
                model: Class,
                attributes: ['id', 'class_name']
            }]
        });

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Materi tidak ditemukan"
            });
        }

        if (material.teacher_id !== teacher.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin membuat diskusi untuk materi ini"
            });
        }
        const newDiscussion = await DiscussionForum.create({
            material_id,
            class_id: material.class_id,
            teacher_id: teacher.id,
            title,
            description
        });

        const discussionWithMaterial = await DiscussionForum.findOne({
            where: { id: newDiscussion.id },
            include: [
                {
                    model: LearningMaterials,
                    as: 'Material',
                    attributes: ['id', 'title', 'description', 'url_material']
                },
                {
                    model: Teacher,
                    attributes: ['id', 'subject_type'],
                    include: [
                        {
                            model: User,
                            attributes: ['username', 'full_name']
                        }
                    ]
                },
                {
                    model: Class,
                    attributes: ['id', 'class_name']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: "Diskusi berhasil dibuat",
            data: discussionWithMaterial
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
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
        let canAccess = false;
        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher && teacher.id === material.teacher_id) {
                canAccess = true;
            }
        } else if (userRole === "Siswa") {
            const student = await Students.findOne({ where: { user_id: userId } });
            if (student && student.class_id === material.class_id) {
                canAccess = true;
            }
        } else if (userRole === "Admin") {
            canAccess = true;
        }

        if (!canAccess) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke diskusi materi ini" });
        }

        const discussions = await DiscussionForum.findAll({
            where: { material_id: materialId },
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
                    include: [{ model: User, attributes: ['username', 'full_name'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            message: "Diskusi berhasil diambil",
            data: discussions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const getDiscussionsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;
        let canAccess = false;

        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher) {
                const discussionCount = await DiscussionForum.count({
                    where: {
                        class_id: classId,
                        teacher_id: teacher.id
                    }
                });
                if (discussionCount > 0) {
                    canAccess = true;
                }
            }
        } else if (userRole === "Siswa") {
            const student = await Students.findOne({ where: { user_id: userId } });
            if (student && student.class_id == classId) {
                canAccess = true;
            }
        } else if (userRole === "Admin") {
            canAccess = true;
        }

        if (!canAccess) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki akses ke diskusi kelas ini" });
        }

        const discussions = await DiscussionForum.findAll({
            where: { class_id: classId },
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
                    include: [{ model: User, attributes: ['username', 'full_name'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            message: "Diskusi kelas berhasil diambil",
            data: discussions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
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

module.exports = {
    createDiscussion,
    getDiscussionsByMaterial,
    getDiscussionsByClass,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    getMyDiscusion
};