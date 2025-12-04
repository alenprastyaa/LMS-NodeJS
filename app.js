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

app.use("/api/roles", Role);
app.use("/api/user", User);
app.use("/api/qr", DailyQr)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/class", classRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/teacher", teacherRoutes);
app.use("/api/teacher-class", teacherClassRoutes)
app.use("/api/learning-materials", learningMaterialsRoute);
app.use("/api/assign-materials", AssignRoutes);
app.use("/api", discussionRoutes);
app.use("/api/subject", SubjectRoute);

const StartApp = async () => {
    try {
        console.log('Connection has been established successfully.');
        await db.sequelize.sync({ alter: true }).then(() => {
            console.log(" Sequelize sync completed (alter: true)");
        });
        console.log('All models were synchronized successfully.');
        app.listen(3400, () => {
            console.log("Aplikasi Berjalan diport : 3400")
        })
    } catch (error) {
        console.log("Unable to connect to the database:", error)
    }
}

StartApp()