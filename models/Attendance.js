const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Attendance = sequelize.define("attandance", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id"
        }
    },
    clock_in: DataTypes.TIME,
    clock_out: DataTypes.TIME,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "attandance",
    timestamps: false,
});

User.hasMany(Attendance, { foreignKey: "user_id" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

module.exports = Attendance;
