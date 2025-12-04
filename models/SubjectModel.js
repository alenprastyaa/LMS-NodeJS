const DataTypes = require('sequelize')
const Db = require("../config/db")

const Subject = Db.define("subject", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    subject_name: {
        type: DataTypes.STRING
    }
})

module.exports = Subject