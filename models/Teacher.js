const DataTypes = require("sequelize")
const db = require("../config/db")
const User = require("./User");


const Teacher = db.define("teacher", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject_type: {
        type: DataTypes.STRING
    }

})

Teacher.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Teacher, { foreignKey: "user_id" });


module.exports = Teacher