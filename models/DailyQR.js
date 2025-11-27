const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DailyQR = sequelize.define("dailyqr", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qr_url: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    tableName: "daily_qr",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
});

module.exports = DailyQR;
