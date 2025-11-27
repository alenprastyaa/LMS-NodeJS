const { DataTypes } = require("sequelize");
const DB = require("../config/db");

const Teacher = require("./Teacher");
const Class = require("./Class");

const LearningMaterials = DB.define("learning_material", {
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: "id"
        }
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Class,
            key: "id"
        }
    },
    title: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    url_material: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

LearningMaterials.belongsTo(Teacher, {
    foreignKey: "teacher_id",
    as: "Teacher"
});

LearningMaterials.belongsTo(Class, {
    foreignKey: "class_id",
    as: "Class"
});

Teacher.hasMany(LearningMaterials, {
    foreignKey: "teacher_id",
    as: "LearningMaterials"
});

Class.hasMany(LearningMaterials, {
    foreignKey: "class_id",
    as: "LearningMaterials"
});


module.exports = LearningMaterials;
