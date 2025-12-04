const DataTypes = require("sequelize")
const db = require("../config/db")

const Teacher = db.define("teacher", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    subject_type: {
        type: DataTypes.UUID,
    },
    class_id: {
        type: DataTypes.UUID,
        allowNull: true
    }

})


module.exports = Teacher