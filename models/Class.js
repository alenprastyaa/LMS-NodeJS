const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Class = sequelize.define("class", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    class_name: DataTypes.STRING,

    homeroom_teacher: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id"
        }
    },
    // head_class: {
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: User,
    //         key: "id"
    //     }
    // },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "class",
    timestamps: false,
});

User.hasMany(Class, { foreignKey: "homeroom_teacher", as: "HomeroomTeacher" });
Class.belongsTo(User, { foreignKey: "homeroom_teacher", as: "HomeroomTeacher" });



module.exports = Class;
