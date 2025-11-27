const Role = require("../models/Role");

const GetAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.json({ success: true, data: roles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: "Role not found" });
        res.json({ success: true, data: role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const createRole = async (req, res) => {
    try {
        const { role_name, clock_in, clock_out } = req.body;
        if (!role_name) return res.status(400).json({ success: false, message: "role_name is required" });

        const newRole = await Role.create({ role_name, clock_in, clock_out });
        res.status(201).json({ success: true, data: newRole });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name, clock_in, clock_out } = req.body;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: "Role not found" });

        await role.update({ role_name, clock_in, clock_out });
        res.json({ success: true, data: role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ success: false, message: "Role not found" });

        await role.destroy();
        res.json({ success: true, message: "Role deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    GetAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
};
