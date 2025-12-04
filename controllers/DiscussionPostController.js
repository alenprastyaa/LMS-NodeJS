const { DiscussionPost, DiscussionForum, User, Students, Teacher, TeacherClass } = require("../models");

const createPost = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;

        const discussion = await DiscussionForum.findByPk(discussionId, {
            include: [{ association: "teacher_class", include: ["teacher"] }],
        });

        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: "Diskusi tidak ditemukan",
            });
        }

        let canPost = false;

        if (userRole === "Guru") {
            const teacher = await Teacher.findOne({
                where: { user_id: userId },
            });

            if (teacher) {
                const isDiscussionOwner =
                    discussion.teacher_class &&
                    discussion.teacher_class.teacher_id === teacher.id;

                if (isDiscussionOwner) {
                    canPost = true;
                }
            }
        } else if (userRole === "Siswa") {
            const student = await User.findOne({
                where: { id: userId },
            });

            if (student && student.class_id === discussion.class_id) {
                canPost = true;
            }
        } else if (userRole === "Admin") {
            canPost = true;
        }

        if (!canPost) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki izin untuk memposting di diskusi ini",
            });
        }
        const newPost = await DiscussionPost.create({
            discussion_id: discussionId,
            user_id: userId,
            content,
        });

        res.status(201).json({
            success: true,
            message: "Postingan berhasil dibuat",
            data: newPost,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        const post = await DiscussionPost.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Postingan tidak ditemukan" });
        }

        if (post.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki izin untuk mengedit postingan ini" });
        }

        await post.update({ content });

        res.json({ success: true, message: "Postingan berhasil diperbarui", data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role.role_name;

        const post = await DiscussionPost.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Postingan tidak ditemukan" });
        }

        let canDelete = false;
        if (post.user_id === userId) { // User can delete their own post
            canDelete = true;
        } else if (userRole === "Admin") { // Admin can delete any post
            canDelete = true;
        } else if (userRole === "Guru") { // Teacher can delete posts in their class discussions
            const discussion = await DiscussionForum.findByPk(post.discussion_id);
            const teacher = await Teacher.findOne({ where: { user_id: userId } });
            if (teacher && discussion && discussion.teacher_id === teacher.id) {
                canDelete = true;
            }
        }

        if (!canDelete) {
            return res.status(403).json({ success: false, message: "Anda tidak memiliki izin untuk menghapus postingan ini" });
        }

        await post.destroy();
        res.json({ success: true, message: "Postingan berhasil dihapus" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createPost,
    updatePost,
    deletePost,
};
