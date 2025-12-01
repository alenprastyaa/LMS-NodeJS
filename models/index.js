const sequelize = require('../config/db');
const Sequelize = require('sequelize');

const db = {};

// IMPORT MODEL TANPA PARAMETER
db.Attendance = require('./Attendance');
db.Class = require('./Class');
db.DailyQR = require('./DailyQR');
db.Role = require('./Role');
db.Students = require('./Students');
db.Teacher = require('./Teacher');
db.TeacherClass = require('./TeacherClass');
db.User = require('./User');
db.LearningMaterials = require('./LearningMaterials');
db.Assign = require('./AssignMaterials');
db.DiscussionForum = require('./DiscussionForum');
db.DiscussionPost = require('./DiscussionPost');
db.Subject = require('./SubjectModel');

// RELATIONS (tetap sama)
db.Teacher.belongsTo(db.User, { foreignKey: "user_id" });
db.User.hasOne(db.Teacher, { foreignKey: "user_id" });

db.Teacher.belongsTo(db.Subject, { foreignKey: "subject_type" });
db.Subject.hasMany(db.Teacher, { foreignKey: "subject_type" });

db.User.hasMany(db.Class, { foreignKey: "homeroom_teacher", as: "HomeroomTeacher" });
db.Class.belongsTo(db.User, { foreignKey: "homeroom_teacher", as: "HomeroomTeacher" });

db.Teacher.belongsToMany(db.Class, {
    through: db.TeacherClass,
    foreignKey: "teacher_id",
    as: "Classes"
});

db.Class.belongsToMany(db.Teacher, {
    through: db.TeacherClass,
    foreignKey: "class_id",
    as: "Teachers"
});

db.User.belongsTo(db.Role, { foreignKey: 'role_id' });
db.Role.hasMany(db.User, { foreignKey: 'role_id' });

db.LearningMaterials.belongsTo(db.Class, { foreignKey: "class_id" })

db.DiscussionForum.belongsTo(db.Class, { foreignKey: 'class_id' });
db.Class.hasMany(db.DiscussionForum, { foreignKey: 'class_id' });
db.DiscussionForum.belongsTo(db.Teacher, { foreignKey: 'teacher_id' });
db.Teacher.hasMany(db.DiscussionForum, { foreignKey: 'teacher_id' });

db.DiscussionForum.belongsTo(db.LearningMaterials, { foreignKey: 'material_id' });
db.LearningMaterials.hasMany(db.DiscussionForum, { foreignKey: 'material_id' });

db.DiscussionPost.belongsTo(db.DiscussionForum, { foreignKey: 'discussion_id' });
db.DiscussionForum.hasMany(db.DiscussionPost, { foreignKey: 'discussion_id' });
db.DiscussionPost.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasMany(db.DiscussionPost, { foreignKey: 'user_id' });

db.Teacher.hasMany(db.LearningMaterials, { foreignKey: "teacher_id", as: "learning_materials" });
db.LearningMaterials.belongsTo(db.Teacher, { foreignKey: "teacher_id", as: "teacher" });

// EXPORT
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
