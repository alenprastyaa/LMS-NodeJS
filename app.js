const express = require('express')
const app = express()
const db = require('./models')
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const Role = require("./routes/roleRoutes");
const User = require('./routes/authRoutes')
const DailyQr = require("./routes/dailyqr")
const attendanceRoutes = require("./routes/attendanceRoutes");
const classRoutes = require("./routes/ClassRoutes");
const studentRoutes = require("./routes/studentRoutes")
const teacherRoutes = require("./routes/TeacherRoutes");
const teacherClassRoutes = require("./routes/teacherClassRoute")
const learningMaterialsRoute = require("./routes/learningMaterialsRoute");
const AssignRoutes = require("./routes/AssignMaterialRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const SubjectRoute = require("./routes/SubjectRoute");

const cors = require('cors')
app.use(cors())

app.use("/api/lms/roles", Role);
app.use("/api/lms/user", User);
app.use("/api/lms/qr", DailyQr)
app.use("/api/lms/attendance", attendanceRoutes);
app.use("/api/lms/class", classRoutes)
app.use("/api/lms/student", studentRoutes)
app.use("/api/lms/teacher", teacherRoutes);
app.use("/api/lms/teacher-class", teacherClassRoutes)
app.use("/api/lms/learning-materials", learningMaterialsRoute);
app.use("/api/lms/assign-materials", AssignRoutes);
app.use("/api/lms", discussionRoutes);
app.use("/api/lms/subject", SubjectRoute);

const StartApp = async () => {
    try {
        console.log('Connection has been established successfully.');
        await db.sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        app.listen(3400, () => {
            console.log("Aplikasi Berjalan diport : 3400")
        })
    } catch (error) {
        console.log("Unable to connect to the database:", error)
    }
}

StartApp()