const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Class = sequelize.define("class", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    class_name: DataTypes.STRING,
    homeroom_teacher: {
        type: DataTypes.UUID,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "class",
    timestamps: false,
});

module.exports = Class;
