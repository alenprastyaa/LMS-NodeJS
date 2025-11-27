const Class = require("../models/Class");
const User = require("../models/User");
const Role = require("../models/Role");
const Students = require("../models/Students");
const { LearningMaterials, Teacher } = require("../models");

// 1. Fungsi getAllClass
const getAllClass = async (req, res) => {
    try {
        const classes = await Class.findAll({
            attributes: ["id", "class_name"],
            include: [
                {
                    model: User,
                    as: "HomeroomTeacher",
                    attributes: ["username"]
                },
                // Include untuk HeadClass dihilangkan
                // {
                //     model: User,
                //     as: "HeadClass",
                //     attributes: ["username"]
                // },
                {
                    model: Students,
                    attributes: ["parent_email"],
                    include: [
                        { model: User, attributes: ["username"] }
                    ]
                },
                {
                    model: LearningMaterials,
                    as: "LearningMaterials",
                    attributes: ["id", "url_material"],
                    include: [
                        {
                            model: Teacher,
                            as: "Teacher",
                        }
                    ]
                }
            ],
            order: [["id", "DESC"]]
        });

        const result = classes.map(c => ({
            id: c.id,
            class_name: c.class_name,
            homeroom_teacher: c.HomeroomTeacher?.username || null,
            // head_class: c.HeadClass?.username || null, // Dihilangkan

            students: c.students.map(s => ({
                parent_email: s.parent_email,
                student_username: s.user?.username || null
            })),
            learning_materials: c.LearningMaterials.map(m => ({
                id: m.id,
                url_material: m.url_material,
                teacher_username: m.Teacher?.username || null
            }))
        }));

        return res.json({ success: true, data: result });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Fungsi getClassById
const getClassById = async (req, res) => {
    try {
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }

        const data = await Class.findOne({
            where: { id },
            include: [
                { model: User, as: "HomeroomTeacher", attributes: ["id", "name"] },
                // Include untuk HeadClass dihilangkan
                // { model: User, as: "HeadClass", attributes: ["id", "name"] }
            ]
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }
        const result = {
            id: data.id,
            class_name: data.class_name,
            homeroom_teacher: data.HomeroomTeacher
                ? { id: data.HomeroomTeacher.id, name: data.HomeroomTeacher.name }
                : null,
            // head_class: data.HeadClass
            //     ? { id: data.HeadClass.id, name: data.HeadClass.name }
            //     : null // Dihilangkan
        };

        return res.json({ success: true, data: result });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createClass = async (req, res) => {
    try {
        const { class_name, homeroom_teacher } = req.body;

        if (!class_name || !homeroom_teacher) {
            return res.status(400).json({
                success: false,
                message: "class_name dan homeroom_teacher wajib diisi"
            });
        }

        if (isNaN(homeroom_teacher)) {
            return res.status(400).json({
                success: false,
                message: "homeroom_teacher harus berupa angka"
            });
        }
        const CheckTeacher = await User.findOne({
            where: { id: homeroom_teacher },
            include: [{ model: Role, as: "role" }]
        });

        if (!CheckTeacher) {
            return res.status(404).json({
                success: false,
                message: "Data Teacher tidak ditemukan"
            });
        }

        if (CheckTeacher.role.role_name !== "Guru") {
            return res.status(403).json({
                success: false,
                message: "User tersebut bukan Guru"
            });
        }
        const alreadyHomeroom = await Class.findOne({
            where: { homeroom_teacher }
        });

        if (alreadyHomeroom) {
            return res.status(400).json({
                success: false,
                message: `Guru ini sudah menjadi wali kelas di kelas: ${alreadyHomeroom.class_name}`
            });
        }
        const data = await Class.create({
            class_name,
            homeroom_teacher,
        });

        return res.status(201).json({
            success: true,
            message: "Class created successfully",
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateClass = async (req, res) => {
    try {
        const id = req.params.id;
        const { class_name, homeroom_teacher } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }

        const checkClass = await Class.findByPk(id);
        if (!checkClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }
        // Validasi diubah: head_class dihilangkan
        if (!class_name || !homeroom_teacher) {
            return res.status(400).json({
                success: false,
                message: "class_name dan homeroom_teacher wajib diisi"
            });
        }
        // Validasi diubah: isNaN(head_class) dihilangkan
        if (isNaN(homeroom_teacher)) {
            return res.status(400).json({
                success: false,
                message: "homeroom_teacher harus berupa angka"
            });
        }
        // Pemeriksaan homeroom_teacher dan head_class tidak boleh sama dihilangkan
        // if (parseInt(homeroom_teacher) === parseInt(head_class)) { ... }

        // Cek Teacher
        const CheckTeacher = await User.findOne({
            where: { id: homeroom_teacher }
        });

        if (!CheckTeacher) {
            return res.status(404).json({
                success: false,
                message: "Data Teacher tidak ditemukan"
            });
        }
        // Cek Head of Class dihilangkan
        // const CheckHead = await User.findOne({ ... });
        // if (!CheckHead) { ... }

        // Update hanya class_name dan homeroom_teacher
        await Class.update(
            { class_name, homeroom_teacher },
            { where: { id } }
        );

        return res.json({
            success: true,
            message: "Class updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Fungsi deleteClass (tidak ada perubahan)
const deleteClass = async (req, res) => {
    try {
        const id = req.params.id;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID harus berupa angka"
            });
        }
        const check = await Class.findByPk(id);

        if (!check) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        await Class.destroy({ where: { id } });

        return res.json({
            success: true,
            message: "Class deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllClass,
    getClassById,
    createClass,
    updateClass,
    deleteClass
};