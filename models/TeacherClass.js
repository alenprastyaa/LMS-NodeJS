const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Teacher = require("./Teacher");
const Class = require("./Class");

const TeacherClass = sequelize.define("teacher_class", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Teacher,
            key: "id"
        }
    },
    class_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Class,
            key: "id"
        }
    }
}, {
    tableName: "teacher_class",
    timestamps: false
});


TeacherClass.belongsTo(Teacher, {
    foreignKey: "teacher_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Teacher.hasMany(TeacherClass, {
    foreignKey: "teacher_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

TeacherClass.belongsTo(Class, {
    foreignKey: "class_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Class.hasMany(TeacherClass, {
    foreignKey: "class_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


module.exports = TeacherClass;
