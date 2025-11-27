const DataTypes = require("sequelize")
const db = require("../config/db")
const LearningMaterials = require("./LearningMaterials")
const User = require("./User")



const Assign = db.define("assign_materials", {
    user_id: {
        type: DataTypes.INTEGER
    },
    material_id: {
        type: DataTypes.INTEGER
    },
    url_assign: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    }

})

Assign.belongsTo(LearningMaterials, { foreignKey: "material_id" })
LearningMaterials.hasMany(Assign, { foreignKey: "material_id" })


Assign.belongsTo(User, { foreignKey: "user_id" })
User.hasMany(Assign, { foreignKey: "user_id" })
module.exports = Assign