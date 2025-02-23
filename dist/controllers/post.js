"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.deletePost = exports.toogleReplayedCommentReplyVote = exports.toogleCommentReplayVote = exports.toogleCommentVote = exports.addReplayToReplayComment = exports.addReplayComment = exports.getPostComment = exports.addComment = exports.isPostSaved = exports.getSavedPost = exports.toogleSavePost = exports.myPosts = exports.isVoted = exports.upOrDownVote = exports.getSinglePost = exports.getFeed = exports.createPost = void 0;
const prisma_1 = __importDefault(require("#/prisma/prisma"));
const cacheUtils_1 = require("#/utils/cacheUtils");
const response_1 = require("#/utils/response");
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { text, image, visibility } = req.body;
    let post;
    if (image) {
        post = yield prisma_1.default.post.create({
            data: {
                text: text,
                image: image,
                authorId: myId,
                visibility,
            },
        });
    }
    else {
        post = yield prisma_1.default.post.create({
            data: {
                text: text,
                authorId: myId,
                visibility,
            },
        });
    }
    (0, response_1.responseReturn)(res, 201, { post, message: "Post is created successfully" });
});
exports.createPost = createPost;
const getFeed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: myId } = req.user;
        const { page } = req.query;
        const myFollowing = yield prisma_1.default.follow.findMany({
            where: {
                followingId: myId,
            },
            select: {
                followingId: true,
                followerId: true,
            },
        });
        const followingIds = myFollowing.map((follow) => follow.followerId);
        followingIds.push(myId);
        const posts = yield prisma_1.default.post.findMany({
            where: {
                OR: [
                    {
                        authorId: {
                            in: followingIds,
                        },
                        visibility: {
                            in: ["ONLY_FOLLOWING", "PUBLIC"],
                        },
                    },
                    {
                        visibility: "PUBLIC",
                    },
                ],
            },
            include: {
                author: true,
                vote: true,
                savedPost: true,
            },
            skip: Number(page) * 3,
            take: 3,
            orderBy: {
                created_at: "desc",
            },
        });
        return res.status(200).json({ posts });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getFeed = getFeed;
const getSinglePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const post = yield prisma_1.default.post.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            author: true,
            vote: true,
            savedPost: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, { post });
});
exports.getSinglePost = getSinglePost;
const upOrDownVote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { id: myId } = req.user;
        const isVoted = yield prisma_1.default.vote.findFirst({
            where: {
                post_id: parseInt(id),
                author_id: myId,
            },
        });
        if (isVoted) {
            yield prisma_1.default.vote.delete({
                where: {
                    id: isVoted === null || isVoted === void 0 ? void 0 : isVoted.id,
                },
            });
        }
        const vote = (_a = req.body) === null || _a === void 0 ? void 0 : _a.vote;
        if (vote === "up-vote") {
            yield prisma_1.default.vote.create({
                data: {
                    author_id: myId,
                    vote: vote,
                    post_id: parseInt(id),
                },
            });
        }
        else if (vote === "down-vote") {
            yield prisma_1.default.vote.create({
                data: {
                    author_id: myId,
                    vote: vote,
                    post_id: parseInt(id),
                },
            });
        }
        const author = yield prisma_1.default.post.findFirst({
            where: {
                id: parseInt(id),
            },
            select: {
                author: true,
            },
        });
        if ((author === null || author === void 0 ? void 0 : author.author.id) && (author === null || author === void 0 ? void 0 : author.author.id) !== myId) {
            yield prisma_1.default.notifiction.create({
                data: {
                    user_id: author === null || author === void 0 ? void 0 : author.author.id,
                    message: `${req.user.name} ${vote.split("-")[0]} voted your post`,
                    image: req.user.avatar,
                },
            });
        }
        const message = vote === "up-vote" ? "Upvoted" : "Devoted";
        (0, response_1.responseReturn)(res, 201, { message });
    }
    catch (error) {
        console.log(error);
        (0, response_1.responseReturn)(res, 403, { error });
    }
});
exports.upOrDownVote = upOrDownVote;
const isVoted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: myId } = req.user;
    const isVoted = yield prisma_1.default.vote.findFirst({
        where: {
            post_id: parseInt(id),
            author_id: myId,
        },
    });
    (0, response_1.responseReturn)(res, 201, { vote: isVoted });
});
exports.isVoted = isVoted;
const myPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const posts = yield prisma_1.default.post.findMany({
        where: {
            authorId: myId,
        },
        include: {
            author: true,
            vote: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, { posts });
});
exports.myPosts = myPosts;
const toogleSavePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { postId } = req.params;
    const isPostAlreadySaved = yield prisma_1.default.savedPost.findFirst({
        where: {
            author_id: myId,
            post_id: parseInt(postId),
        },
    });
    const postUser = yield prisma_1.default.user.findFirst({
        where: {
            posts: {
                some: {
                    id: parseInt(postId),
                },
            },
        },
        select: {
            avatar: true,
            id: true,
            name: true,
        },
    });
    if (isPostAlreadySaved) {
        yield prisma_1.default.savedPost.delete({
            where: {
                id: isPostAlreadySaved.id,
            },
        });
        return (0, response_1.responseReturn)(res, 201, { message: "Post Is Removed From Saved" });
    }
    else {
        yield prisma_1.default.savedPost.create({
            data: {
                author_id: myId,
                post_id: parseInt(postId),
            },
        });
        if (postUser) {
            yield prisma_1.default.notifiction.create({
                data: {
                    user_id: postUser.id,
                    message: `${req.user.name} saved your post`,
                    image: req.user.avatar,
                },
            });
        }
    }
    const message = "Post Saved Successfully";
    (0, response_1.responseReturn)(res, 201, { message });
});
exports.toogleSavePost = toogleSavePost;
const getSavedPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { page } = req.query;
    const posts = yield prisma_1.default.savedPost.findMany({
        where: {
            author_id: myId,
        },
        include: {
            author: true,
            post: {
                include: {
                    vote: true,
                    savedPost: true,
                    author: true,
                },
            },
        },
        skip: Number(page) * 8,
        take: Number(page) * 8 + 8,
    });
    const mPost = posts.map((saved) => saved.post);
    (0, response_1.responseReturn)(res, 201, { posts: mPost });
});
exports.getSavedPost = getSavedPost;
const isPostSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { postId } = req.params;
    const post = yield prisma_1.default.savedPost.findFirst({
        where: {
            author_id: myId,
            post_id: parseInt(postId),
        },
    });
    (0, response_1.responseReturn)(res, 201, { isSaved: post ? true : false });
});
exports.isPostSaved = isPostSaved;
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { id } = req.params;
    const { text } = req.body;
    yield (0, cacheUtils_1.invalidatePostCommentCache)(id);
    const comment = yield prisma_1.default.comment.create({
        data: {
            author_id: myId,
            post_id: parseInt(id),
            text: text,
        },
        include: {
            author: true,
        },
    });
    const postUser = yield prisma_1.default.user.findFirst({
        where: {
            posts: {
                some: {
                    id: parseInt(id),
                },
            },
        },
        select: {
            avatar: true,
            id: true,
            name: true,
        },
    });
    if (postUser) {
        yield prisma_1.default.notifiction.create({
            data: {
                user_id: postUser.id,
                message: `(${req.user.name} commented on your post) ${text}`,
                image: req.user.avatar,
            },
        });
    }
    (0, response_1.responseReturn)(res, 201, {
        message: "Comment added successfully",
        success: true,
        comment,
    });
});
exports.addComment = addComment;
const getPostComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // const cachedComments = await getCachePostComment(id);
    // if (cachedComments) {
    //   return responseReturn(res, 200, {
    //     comments: cachedComments,
    //   });
    // }
    const comments = yield prisma_1.default.comment.findMany({
        where: {
            post_id: parseInt(id),
        },
        include: {
            author: true,
            post: true,
            vote: true,
            replayedComment: {
                include: {
                    author: {
                        select: {
                            avatar: true,
                            name: true,
                            email: true,
                        },
                    },
                    vote: true,
                    replies: {
                        include: {
                            replay_to_author: {
                                select: {
                                    avatar: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            author: {
                                select: {
                                    avatar: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            replayToReplyCommentVote: true,
                        },
                    },
                },
            },
        },
    });
    // await cachePostComment(id, comments);
    (0, response_1.responseReturn)(res, 201, { comments });
});
exports.getPostComment = getPostComment;
const addReplayComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { id } = req.params;
    const { text } = req.body;
    const replayToComment = yield prisma_1.default.replayToComment.create({
        data: {
            author_id: myId,
            comment_id: parseInt(id),
            text: text,
        },
        include: {
            comment: {
                select: {
                    post_id: true,
                },
            },
            author: true,
            replies: true,
            vote: true,
        },
    });
    const replayedUser = yield prisma_1.default.user.findFirst({
        where: {
            comments: {
                some: {
                    id: parseInt(id),
                },
            },
        },
        select: {
            avatar: true,
            name: true,
            id: true,
        },
    });
    if (replayedUser) {
        yield prisma_1.default.notifiction.create({
            data: {
                user_id: replayedUser.id,
                message: `(${req.user.name} replayed you) ${text}`,
                image: req.user.avatar,
            },
        });
    }
    // await invalidatePostCommentCache(replayToComment.comment.post_id);
    (0, response_1.responseReturn)(res, 201, {
        message: "Replay added to comment successfully",
        replayToComment,
    });
});
exports.addReplayComment = addReplayComment;
const addReplayToReplayComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { text, replayToAuthorId, replayToCommentId } = req.body;
    const addReplayToReplay = yield prisma_1.default.replayToReplayComment.create({
        data: {
            author_id: myId,
            text: text,
            replay_to_author_id: parseInt(replayToAuthorId),
            replay_to_comment_id: parseInt(replayToCommentId),
        },
        include: {
            replay_to_comment: {
                include: {
                    comment: {
                        select: {
                            post_id: true,
                        },
                    },
                    author: true,
                    replies: true,
                    vote: true,
                },
            },
        },
    });
    const replayedUser = yield prisma_1.default.user.findFirst({
        where: {
            id: parseInt(replayToAuthorId),
        },
        select: {
            avatar: true,
            name: true,
            id: true,
        },
    });
    if (replayedUser) {
        yield prisma_1.default.notifiction.create({
            data: {
                user_id: replayedUser.id,
                message: `(${req.user.name} replayed you) ${text}`,
                image: req.user.avatar,
            },
        });
    }
    yield (0, cacheUtils_1.invalidatePostCommentCache)(addReplayToReplay.replay_to_comment.comment.post_id);
    (0, response_1.responseReturn)(res, 201, {
        message: "Replay added to comment successfully",
        replayToReplayComment: addReplayToReplay,
    });
});
exports.addReplayToReplayComment = addReplayToReplayComment;
const toogleCommentVote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: myId } = req.user;
    const { id } = req.params;
    const isVoted = yield prisma_1.default.commentVote.findFirst({
        where: {
            comment_id: parseInt(id),
            author_id: myId,
        },
    });
    if (isVoted) {
        yield prisma_1.default.commentVote.delete({
            where: {
                id: isVoted === null || isVoted === void 0 ? void 0 : isVoted.id,
            },
        });
    }
    const vote = (_a = req.body) === null || _a === void 0 ? void 0 : _a.vote;
    if (vote === "up-vote") {
        yield prisma_1.default.commentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                comment_id: parseInt(id),
            },
        });
    }
    else if (vote === "down-vote") {
        yield prisma_1.default.commentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                comment_id: parseInt(id),
            },
        });
    }
    const message = vote === "up-vote" ? "Upvoted" : "Devoted";
    (0, response_1.responseReturn)(res, 201, { message });
});
exports.toogleCommentVote = toogleCommentVote;
const toogleCommentReplayVote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: myId } = req.user;
    const { id } = req.params;
    const isVoted = yield prisma_1.default.replayToCommentVote.findFirst({
        where: {
            reply_to_comment_id: parseInt(id),
            author_id: myId,
        },
    });
    if (isVoted) {
        yield prisma_1.default.replayToCommentVote.delete({
            where: {
                id: isVoted === null || isVoted === void 0 ? void 0 : isVoted.id,
            },
        });
    }
    const vote = (_a = req.body) === null || _a === void 0 ? void 0 : _a.vote;
    if (vote === "up-vote") {
        yield prisma_1.default.replayToCommentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                reply_to_comment_id: parseInt(id),
            },
        });
    }
    else if (vote === "down-vote") {
        yield prisma_1.default.replayToCommentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                reply_to_comment_id: parseInt(id),
            },
        });
    }
    const message = vote === "up-vote" ? "Upvoted" : "Devoted";
    (0, response_1.responseReturn)(res, 201, { message });
});
exports.toogleCommentReplayVote = toogleCommentReplayVote;
const toogleReplayedCommentReplyVote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: myId } = req.user;
    const { id } = req.params;
    const isVoted = yield prisma_1.default.replayToReplyCommentVote.findFirst({
        where: {
            reply_to_reply_comment_id: parseInt(id),
            author_id: myId,
        },
    });
    if (isVoted) {
        yield prisma_1.default.replayToReplyCommentVote.delete({
            where: {
                id: isVoted === null || isVoted === void 0 ? void 0 : isVoted.id,
            },
        });
    }
    const vote = (_a = req.body) === null || _a === void 0 ? void 0 : _a.vote;
    if (vote === "up-vote") {
        yield prisma_1.default.replayToReplyCommentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                reply_to_reply_comment_id: parseInt(id),
            },
        });
    }
    else if (vote === "down-vote") {
        yield prisma_1.default.replayToReplyCommentVote.create({
            data: {
                author_id: myId,
                vote: vote,
                reply_to_reply_comment_id: parseInt(id),
            },
        });
    }
    const message = vote === "up-vote" ? "Upvoted" : "Devoted";
    (0, response_1.responseReturn)(res, 201, { message });
});
exports.toogleReplayedCommentReplyVote = toogleReplayedCommentReplyVote;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { id } = req.params;
    const isExist = yield prisma_1.default.post.findUnique({
        where: {
            id: parseInt(id),
            authorId: myId,
        },
    });
    if (!isExist || isExist.authorId !== myId) {
        return (0, response_1.responseReturn)(res, 401, { error: "Post not found." });
    }
    yield prisma_1.default.post.delete({
        where: {
            id: parseInt(id),
            authorId: myId,
        },
    });
    const message = "Post deleted successfully";
    (0, response_1.responseReturn)(res, 201, { message });
});
exports.deletePost = deletePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { text, image, visibility } = req.body;
    const { id } = req.params;
    const isExist = yield prisma_1.default.post.findUnique({
        where: {
            id: parseInt(id),
            authorId: myId,
        },
    });
    if (!isExist || isExist.authorId !== myId) {
        return (0, response_1.responseReturn)(res, 401, { error: "Post not found." });
    }
    yield prisma_1.default.post.update({
        where: {
            id: parseInt(id),
            authorId: myId,
        },
        data: {
            text,
            image,
            visibility,
        },
    });
    (0, response_1.responseReturn)(res, 201, { message: "Post is updated successfully" });
});
exports.updatePost = updatePost;
//# sourceMappingURL=post.js.map