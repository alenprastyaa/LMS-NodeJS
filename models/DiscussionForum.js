const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Class = require("./Class");
const TeacherClass = require("./TeacherClass");


const DiscussionForum = sequelize.define("discussion_forums", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Class,
            key: "id"
        }
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeacherClass,
            key: "id"
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "discussion_forums",
    timestamps: false,
});

DiscussionForum.belongsTo(Class, { foreignKey: 'class_id' });
Class.hasMany(DiscussionForum, { foreignKey: 'class_id' });

DiscussionForum.belongsTo(TeacherClass, { foreignKey: 'teacher_id' });
TeacherClass.hasMany(DiscussionForum, { foreignKey: 'teacher_id' });


module.exports = DiscussionForum;
