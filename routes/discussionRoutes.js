const express = require("express");
const router = express.Router();
const { verifyToken, GuruOnly, StudentOnly, AdminOnly, AuthMiddleares } = require("../middleware/authMiddleware");
const discussionForumController = require("../controllers/DiscussionForumController");
const discussionPostController = require("../controllers/DiscussionPostController");

router.post("/classes/discussions", AuthMiddleares, GuruOnly, discussionForumController.createDiscussion);
router.get("/materials/:materialId/discussions-material", AuthMiddleares, discussionForumController.getDiscussionsByMaterial);
router.get("/classes/:classId/discussions", AuthMiddleares, discussionForumController.getDiscussionsByClass);
router.get("/discussions/:id", AuthMiddleares, discussionForumController.getDiscussionById);
router.put("/discussions/:id", AuthMiddleares, GuruOnly, discussionForumController.updateDiscussion);
router.delete("/discussions/:id", AuthMiddleares, GuruOnly, discussionForumController.deleteDiscussion);
router.post("/discussions/:discussionId/posts", AuthMiddleares, discussionPostController.createPost);
router.put("/posts/:postId", AuthMiddleares, discussionPostController.updatePost);
router.delete("/posts/:postId", AuthMiddleares, discussionPostController.deletePost);
router.get("/discusion/my/disc", AuthMiddleares, discussionForumController.getMyDiscusion);

module.exports = router;