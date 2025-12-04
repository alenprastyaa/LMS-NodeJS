const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const DiscussionForum = require("./DiscussionForum");
const User = require("./User");

const DiscussionPost = sequelize.define("discussion_posts", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    discussion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DiscussionForum,
            key: "id"
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "discussion_posts",
    timestamps: false, // We'll manage created_at and updated_at manually or through hooks if needed
});

// Associations (will also be defined in models/index.js)
DiscussionPost.belongsTo(DiscussionForum, { foreignKey: 'discussion_id' });
DiscussionForum.hasMany(DiscussionPost, { foreignKey: 'discussion_id' });

DiscussionPost.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(DiscussionPost, { foreignKey: 'user_id' });

module.exports = DiscussionPost;
