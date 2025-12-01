const DataTypes = require("sequelize")
const db = require("../config/db")

const Teacher = db.define("teacher", {

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subject_type: {
        type: DataTypes.INTEGER
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

})


module.exports = Teacher