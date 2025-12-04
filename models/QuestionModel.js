const DataTypes = require('sequelize')
const Db = require('../config/db')


const Question = Db.define("question", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    teacher_id: {
        type: DataTypes.UUID,
    },
    question_name: {
        type: DataTypes.STRING
    },
    option_a: {
        type: DataTypes.STRING
    },
    option_b: {
        type: DataTypes.STRING
    },
    option_c: {
        type: DataTypes.STRING
    },
    option_d: {
        type: DataTypes.STRING
    },
    option_e: {
        type: DataTypes.STRING
    },
    correct_option: {
        type: DataTypes.STRING
    }

})

module.exports = Question