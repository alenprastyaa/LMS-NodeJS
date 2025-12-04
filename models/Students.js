const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Class = require("./Class");

const Students = sequelize.define("students", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    class_id: {
        type: DataTypes.UUID,
        references: {
            model: Class,
            key: "id"
        }
    },
    user_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: "id"
        }
    },
    parent_email: DataTypes.STRING,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "students",
    timestamps: false,
});

Class.hasMany(Students, { foreignKey: "class_id" });
Students.belongsTo(Class, { foreignKey: "class_id" });

User.hasOne(Students, { foreignKey: "user_id" });
Students.belongsTo(User, { foreignKey: "user_id" });


module.exports = Students;
