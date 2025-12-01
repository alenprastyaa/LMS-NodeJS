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
        console.log("============================================");
        console.log("🔌  Starting Application...");
        console.log("============================================\n");

        console.log("⏳  Testing database connection...");
        await db.sequelize.authenticate();
        console.log("✅  Database connection established successfully!\n");

        console.log("📁  Registered Sequelize Models:");
        console.log("--------------------------------------------");
        Object.keys(db).forEach(key => {
            if (key !== "sequelize" && key !== "Sequelize") {
                console.log(" -", key);
            }
        });
        console.log("--------------------------------------------\n");
        console.log("⏳  Synchronizing database tables...");
        await db.sequelize.sync({ alter: true });

        console.log("✅  All models synchronized successfully!\n");
        const PORT = 3400;
        app.listen(PORT, () => {
            console.log(`🚀  Server running at http://localhost:${PORT}`);
        });

        console.log("\n============================================");
        console.log("🎉  Application started successfully!");
        console.log("============================================");

    } catch (error) {
        console.log("\n❌  Unable to start application!");
        console.log("============================================");
        console.error("🔥  Error details:", error.message);
        console.error(error);
        console.log("============================================\n");
    }
};

StartApp()