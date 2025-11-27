const Attendance = require("../models/Attendance");
const DailyQR = require("../models/DailyQR");
const User = require("../models/User")
const { Op, Sequelize } = require("sequelize");

const scanQR = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "QR tidak valid"
            });
        }

        const today = new Date().toISOString().slice(0, 10);
        const qrData = await DailyQR.findOne({ where: { token: code } });
        if (!qrData) {
            return res.status(400).json({
                success: false,
                message: "QR tidak dikenal atau tidak valid"
            });
        }

        if (qrData.tanggal !== today) {
            return res.status(400).json({
                success: false,
                message: "QR sudah kedaluwarsa atau bukan untuk hari ini"
            });
        }
        const existingAttendance = await Attendance.findOne({
            where: {
                user_id,
                created_at: {
                    [Op.gte]: new Date(today + " 00:00:00"),
                    [Op.lte]: new Date(today + " 23:59:59"),
                }
            }
        });

        if (existingAttendance && existingAttendance.clock_in && !existingAttendance.clock_out) {
            existingAttendance.clock_out = new Date().toTimeString().slice(0, 8);
            await existingAttendance.save();

            return res.json({
                success: true,
                message: "Clock Out berhasil",
                data: existingAttendance
            });
        }

        if (existingAttendance && existingAttendance.clock_out) {
            return res.json({
                success: false,
                message: "Kamu sudah absen masuk & pulang hari ini"
            });
        }
        const absen = await Attendance.create({
            user_id,
            clock_in: new Date().toTimeString().slice(0, 8),
        });
        return res.json({
            success: true,
            message: "Clock In berhasil",
            data: absen
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const GetAllAttendance = async (req, res) => {
    try {

        const data = await Attendance.findAll({
            include: [
                {
                    model: User,
                    attributes: ["username", "email"]
                }
            ],
            order: [["created_at", "DESC"]]
        });

        return res.json({
            success: true,
            message: "Data absensi semua user",
            total: data.length,
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
const GetMyAttendanceToday = async (req, res) => {
    try {
        const user_id = req.user.id;
        const today = new Date().toISOString().slice(0, 10);

        const data = await Attendance.findOne({
            where: {
                user_id,
                created_at: {
                    [Op.gte]: new Date(today + " 00:00:00"),
                    [Op.lte]: new Date(today + " 23:59:59"),
                }
            }
        });

        return res.json({
            success: true,
            message: "Absensi hari ini",
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
const GetAllMyAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;

        const data = await Attendance.findAll({
            where: { user_id },
            order: [["created_at", "DESC"]]
        });

        return res.json({
            success: true,
            message: "Riwayat absensi",
            total: data.length,
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
module.exports = { scanQR, GetAllAttendance, GetMyAttendanceToday, GetAllMyAttendance };
