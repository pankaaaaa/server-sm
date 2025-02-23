"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("#/controllers/post");
const authMiddleware_1 = require("#/middleware/authMiddleware");
const validator_1 = require("#/middleware/validator");
const validationSchema_1 = require("#/utils/validationSchema");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/feed-post", authMiddleware_1.authMiddleware, post_1.getFeed);
router.post("/new", (0, validator_1.validate)(validationSchema_1.CreatePostSchema), authMiddleware_1.authMiddleware, post_1.createPost);
router.post("/up-or-down-vote/:id", (0, validator_1.validate)(validationSchema_1.UpVoteDownVoteSchema), authMiddleware_1.authMiddleware, post_1.upOrDownVote);
router.post("/is-voted", authMiddleware_1.authMiddleware, post_1.upOrDownVote);
router.get("/my-posts", authMiddleware_1.authMiddleware, post_1.myPosts);
router.post("/save/:postId", authMiddleware_1.authMiddleware, post_1.toogleSavePost);
router.get("/get-saved-post", authMiddleware_1.authMiddleware, post_1.getSavedPost);
router.get("/is-post-saved/:postId", authMiddleware_1.authMiddleware, post_1.isPostSaved);
router.post("/add-comment/:id", (0, validator_1.validate)(validationSchema_1.AddCommentSchema), authMiddleware_1.authMiddleware, post_1.addComment);
router.post("/add-replay-comment/:id", (0, validator_1.validate)(validationSchema_1.AddCommentSchema), authMiddleware_1.authMiddleware, post_1.addReplayComment);
router.post("/add-replay-to-replay", (0, validator_1.validate)(validationSchema_1.AddReplayToReplayCommentSchema), authMiddleware_1.authMiddleware, post_1.addReplayToReplayComment);
router.post("/toggle-comment-vote/:id", authMiddleware_1.authMiddleware, post_1.toogleCommentVote);
router.post("/toggle-reply-comment-vote/:id", authMiddleware_1.authMiddleware, post_1.toogleCommentReplayVote);
router.post("/toggle-reply-to-reply-comment-vote/:id", authMiddleware_1.authMiddleware, post_1.toogleReplayedCommentReplyVote);
router.get("/comment/:id", authMiddleware_1.authMiddleware, post_1.getPostComment);
router.get("/:id", authMiddleware_1.authMiddleware, post_1.getSinglePost);
router.delete("/:id", authMiddleware_1.authMiddleware, post_1.deletePost);
router.put("/:id", authMiddleware_1.authMiddleware, post_1.updatePost);
exports.default = router;
//# sourceMappingURL=post.route.js.map