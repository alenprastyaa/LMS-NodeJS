const DataTypes = require('sequelize')
const Db = require("../config/db")

const Subject = Db.define("subject", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subject_name: {
        type: DataTypes.STRING
    }
})

module.exports = Subject