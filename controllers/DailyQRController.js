const QRCode = require("qrcode");
const axios = require("axios");
const FormData = require("form-data");

const DailyQR = require("../models/DailyQR");

const generateDailyQR = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const existingQR = await DailyQR.findOne({ where: { tanggal: today } });

        if (existingQR) {
            return res.json({
                success: true,
                message: "QR untuk hari ini sudah dibuat",
                data: existingQR
            });
        }
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const token = `${today}-${random}`;
        const qrScanUrl = `https://domain-absensi.com/scan?code=${token}`;
        const qrBuffer = await QRCode.toBuffer(qrScanUrl);
        const form = new FormData();
        form.append("file", qrBuffer, {
            filename: `qr-${today}.png`,
            contentType: "image/png"
        });

        const upload = await axios.post(
            "https://invitations.my.id/api/upload-file",
            form,
            { headers: form.getHeaders() }
        );
        const qrUrl = upload?.data?.data?.path;
        const newQR = await DailyQR.create({
            tanggal: today,
            token: token,
            qr_url: qrUrl
        });

        return res.json({
            success: true,
            message: "QR berhasil dibuat",
            data: newQR
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { generateDailyQR };
