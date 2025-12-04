const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Role = sequelize.define("role", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    role_name: DataTypes.STRING,
    clock_in: DataTypes.TIME,
    clock_out: DataTypes.TIME,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "role",
    timestamps: false,
});

module.exports = Role;
