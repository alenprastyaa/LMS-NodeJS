const multer = require("multer");

const storage = multer.memoryStorage();

const uploadExcel = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/vnd.ms-excel"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files are allowed"), false);
        }
    }
});

module.exports = uploadExcel;
