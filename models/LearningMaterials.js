const { DataTypes } = require("sequelize");
const DB = require("../config/db");
const Teacher = require("./Teacher");
const Class = require("./Class");

const LearningMaterials = DB.define("learning_material", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
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
        // allowNull: false,
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

LearningMaterials.belongsTo(Class, { foreignKey: "class_id" })
Class.hasMany(LearningMaterials, { foreignKey: "class_id" })


module.exports = LearningMaterials;
