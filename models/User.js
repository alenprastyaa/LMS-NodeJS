const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Role = require("./Role");
const Class = require("./Class");

const User = sequelize.define("users", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "active"
    },
    full_name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role_id: {
        type: DataTypes.UUID,
        references: {
            model: Role,
            key: "id"
        }
    },
    class_id: {
        type: DataTypes.UUID,
        references: {
            model: Class,
            key: "id"
        }
    },
    parent_email: {
        type: DataTypes.STRING
    },
    parent_contact: {
        type: DataTypes.STRING
    },
    email: DataTypes.STRING,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "users",
    timestamps: false,
});

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });


Class.hasMany(User, { foreignKey: "class_id" })
User.belongsTo(Class, { foreignKey: "class_id" })

module.exports = User;
