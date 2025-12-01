const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Teacher = require("./Teacher");
const Class = require("./Class");

const TeacherClass = sequelize.define("teacher_class", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    teacher_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Teacher,
            key: "id"
        }
    },

    class_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Class,
            key: "id"
        }
    }
}, {
    tableName: "teacher_class",
    timestamps: false
});



TeacherClass.belongsTo(Class, { foreignKey: "teacher_id" })
Class.hasMany(TeacherClass, { foreignKey: "teacher_id" })


module.exports = TeacherClass;
