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
exports.seenNotification = exports.getMyNotificationsCount = exports.getMyNotifications = exports.getAllPeoples = exports.getUserFollowingList = exports.getUserFollowersList = exports.getDashboardPostActivityData = exports.getDashboardMessageSentData = exports.getDashboardData = exports.getUserPosts = exports.serachUser = exports.isFollow = exports.followUser = exports.getRecommendedUser = exports.getUser = void 0;
const prisma_1 = __importDefault(require("../prisma/prisma"));
const response_1 = require("../utils/response");
const date_fns_1 = require("date-fns");
const helper_1 = require("../utils/helper");
const socket_1 = require("../socket/socket");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    const followersCount = yield prisma_1.default.follow.count({
        where: {
            followerId: parseInt(id),
        },
    });
    const followingCount = yield prisma_1.default.follow.count({
        where: {
            followingId: parseInt(id),
        },
    });
    const mUser = user;
    mUser.followersCount = followersCount;
    mUser.followingCount = followingCount;
    const totalPosts = yield prisma_1.default.post.count({
        where: {
            authorId: parseInt(id),
        },
    });
    (0, response_1.responseReturn)(res, 201, {
        user: mUser,
        totalPosts,
    });
});
exports.getUser = getUser;
const getRecommendedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id: myId } = req.user;
        const chats = yield prisma_1.default.chat.findMany({
            where: {
                friends: {
                    some: {
                        id: myId,
                    },
                },
            },
            select: {
                friends: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        const chatUserIds = chats.flatMap((chat) => chat.friends.map((friend) => friend.id));
        const excludeUserIds = [...chatUserIds, myId];
        const users = yield prisma_1.default.user.findMany({
            where: {
                id: {
                    notIn: excludeUserIds,
                },
            },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                about: true,
            },
        });
        return res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getRecommendedUser = getRecommendedUser;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: myId } = req.user;
    const existingFollow = yield prisma_1.default.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: parseInt(id),
                followingId: myId,
            },
        },
    });
    const receiverSocketId = (0, socket_1.getReceiverSocketId)(id);
    if (existingFollow) {
        yield prisma_1.default.follow.delete({
            where: {
                id: existingFollow.id,
            },
        });
        const notification = yield prisma_1.default.notifiction.create({
            data: {
                user_id: parseInt(id),
                message: `${req.user.name} unfollowed you`,
                image: req.user.avatar,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        if (receiverSocketId) {
            socket_1.io.to(receiverSocketId).emit("newNotification", notification);
        }
    }
    else {
        yield prisma_1.default.follow.create({
            data: {
                follower: {
                    connect: { id: parseInt(id) },
                },
                following: {
                    connect: { id: myId },
                },
            },
        });
        const notification = yield prisma_1.default.notifiction.create({
            data: {
                user_id: parseInt(id),
                message: `${req.user.name} followed you`,
                image: req.user.avatar,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        if (receiverSocketId) {
            if (receiverSocketId) {
                socket_1.io.to(receiverSocketId).emit("newNotification", notification);
            }
        }
    }
    (0, response_1.responseReturn)(res, 201, { success: true });
});
exports.followUser = followUser;
const isFollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { id: myId } = req.user;
    const follow = yield prisma_1.default.follow.findFirst({
        where: {
            followerId: parseInt(id),
            followingId: myId,
        },
    });
    (0, response_1.responseReturn)(res, 201, follow ? true : false);
});
exports.isFollow = isFollow;
const serachUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const searchValue = req.query.search;
    if (searchValue === "") {
        (0, response_1.responseReturn)(res, 201, []);
    }
    const users = yield prisma_1.default.user.findMany({
        where: {
            name: {
                contains: searchValue,
                mode: "insensitive",
            },
            id: {
                not: myId,
            },
        },
        select: {
            avatar: true,
            email: true,
            id: true,
            name: true,
            about: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, users);
});
exports.serachUser = serachUser;
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    const { userId } = req.params;
    const posts = yield prisma_1.default.post.findMany({
        where: {
            authorId: parseInt(userId),
        },
        include: {
            author: true,
            savedPost: true,
            vote: true,
        },
        skip: Number(page) * 4,
        take: Number(page) * 4 + 4,
        orderBy: {
            created_at: "desc",
        },
    });
    (0, response_1.responseReturn)(res, 201, { posts });
});
exports.getUserPosts = getUserPosts;
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    //const cacheKey = `user_profile_${id}`;
    // client.get(cacheKey, (err: Error | null, cachedProfile: string | null) => {
    //   if (cachedProfile) {
    //     // Serve cached profile
    //     res.send(cachedProfile);
    //   } else {
    //     // Fetch user profile from the database
    //     // Cache the user profile
    //     client.setex(cacheKey, 3600, "userProfile"); // Cache for 1 hour
    //     res.send("userProfile");
    //   }
    // });
    const commentsCount = yield prisma_1.default.comment.count({
        where: {
            author_id: id,
        },
    });
    const commentReplayCount = yield prisma_1.default.replayToComment.count({
        where: {
            author_id: id,
        },
    });
    const replayedCommentReplayCount = yield prisma_1.default.replayToReplayComment.count({
        where: {
            author_id: id,
        },
    });
    const totalCommentsCount = commentsCount + commentReplayCount + replayedCommentReplayCount;
    const chatMessagesCount = yield prisma_1.default.message.count({
        where: {
            senderId: id,
        },
    });
    const groupChatMessagesCount = yield prisma_1.default.message.count({
        where: {
            senderId: id,
        },
    });
    const messageCount = chatMessagesCount + groupChatMessagesCount;
    const postUpvotesCount = yield prisma_1.default.vote.count({
        where: {
            author_id: id,
            vote: "up-vote",
        },
    });
    const postDisvotesCount = yield prisma_1.default.vote.count({
        where: {
            author_id: id,
            vote: "down-vote",
        },
    });
    const chatsYouPartOf = yield prisma_1.default.chat.count({
        where: {
            friends: {
                some: {
                    id: id,
                },
            },
        },
    });
    const GroupChatsYouPartOf = yield prisma_1.default.groupChat.count({
        where: {
            friends: {
                some: {
                    id: id,
                },
            },
        },
    });
    const recentFollowersArray = yield prisma_1.default.follow.findMany({
        where: {
            followingId: id,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            follower: true,
        },
        take: 4,
    });
    const recentFollowers = recentFollowersArray.map((recent) => recent.follower);
    (0, response_1.responseReturn)(res, 201, {
        totalCommentsCount,
        messageCount,
        postUpvotesCount,
        postDisvotesCount,
        GroupChatsYouPartOf,
        chatsYouPartOf,
        recentFollowers,
    });
});
exports.getDashboardData = getDashboardData;
const getDashboardMessageSentData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const now = new Date();
    const start = (0, date_fns_1.startOfMonth)(now);
    const end = now; // today date
    const data = yield prisma_1.default.message.findMany({
        where: {
            senderId: id,
            created_at: {
                gte: start,
                lte: end,
            },
        },
        select: {
            created_at: true,
        },
    });
    // Process the posts to count messages per day
    const messageCountByDate = data.reduce((acc, post) => {
        const date = post.created_at.toISOString().split("T")[0];
        if (!acc[date]) {
            acc[date] = 1;
        }
        else {
            acc[date]++;
        }
        return acc;
    }, {});
    // Generate all dates from the start of the month to today
    const allDates = (0, date_fns_1.eachDayOfInterval)({ start, end }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
    // Merge the dates with message counts
    const result = allDates.map((date) => ({
        date,
        count: messageCountByDate[date] || 0,
    }));
    (0, response_1.responseReturn)(res, 201, { data: result });
});
exports.getDashboardMessageSentData = getDashboardMessageSentData;
const getDashboardPostActivityData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const now = new Date();
    let start = (0, date_fns_1.startOfMonth)(now);
    const end = now;
    const { duration } = req.query;
    if (duration) {
        start = (0, helper_1.convertDaysToDate)(duration);
    }
    const data = yield prisma_1.default.vote.findMany({
        where: {
            author_id: id,
            created_at: {
                gte: start,
                lte: end,
            },
        },
        select: {
            created_at: true,
            vote: true,
        },
    });
    // Process the votes to count disvotes and upvotes per day
    const voteCountByDate = data.reduce((acc, vote) => {
        const date = vote.created_at.toISOString().split("T")[0];
        if (!acc[date]) {
            acc[date] = { upvote: 0, disvote: 0 };
        }
        if (vote.vote === "up-vote") {
            acc[date].upvote++;
        }
        else if (vote.vote === "down-vote") {
            acc[date].disvote++;
        }
        return acc;
    }, {});
    // Generate all dates from the start of the month to today
    const allDates = (0, date_fns_1.eachDayOfInterval)({ start, end }).map((date) => (0, date_fns_1.format)(date, "yyyy-MM-dd"));
    const result = allDates.map((date) => {
        var _a, _b;
        return ({
            date,
            upvote: ((_a = voteCountByDate[date]) === null || _a === void 0 ? void 0 : _a.upvote) || 0,
            disvote: ((_b = voteCountByDate[date]) === null || _b === void 0 ? void 0 : _b.disvote) || 0,
        });
    });
    (0, response_1.responseReturn)(res, 201, { data: result });
});
exports.getDashboardPostActivityData = getDashboardPostActivityData;
const getUserFollowersList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { id: myId } = req.user;
    if (myId === parseInt(id)) {
        const followers = yield prisma_1.default.user.findUnique({
            where: {
                id: myId,
            },
            include: {
                followers: {
                    include: {
                        following: true,
                    },
                },
            },
        });
        const sortedData = (_a = followers === null || followers === void 0 ? void 0 : followers.followers) === null || _a === void 0 ? void 0 : _a.map((f) => f.following);
        return (0, response_1.responseReturn)(res, 201, {
            followers: sortedData || [],
        });
    }
    const followers = yield prisma_1.default.user.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            followers: {
                include: {
                    following: true,
                },
            },
        },
    });
    const sortedData = (_b = followers === null || followers === void 0 ? void 0 : followers.followers) === null || _b === void 0 ? void 0 : _b.map((f) => f.following);
    (0, response_1.responseReturn)(res, 201, { followers: sortedData || [] });
});
exports.getUserFollowersList = getUserFollowersList;
const getUserFollowingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const { id: myId } = req.user;
    if (myId === parseInt(id)) {
        const following = yield prisma_1.default.user.findUnique({
            where: {
                id: myId,
            },
            include: {
                following: {
                    include: {
                        follower: true,
                    },
                },
            },
        });
        const sortedData = (_a = following === null || following === void 0 ? void 0 : following.following) === null || _a === void 0 ? void 0 : _a.map((f) => f.follower);
        return (0, response_1.responseReturn)(res, 201, { following: sortedData || [] });
    }
    const following = yield prisma_1.default.user.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            following: {
                include: {
                    follower: true,
                },
            },
        },
    });
    const sortedData = (_b = following === null || following === void 0 ? void 0 : following.following) === null || _b === void 0 ? void 0 : _b.map((f) => f.follower);
    return (0, response_1.responseReturn)(res, 201, { following: sortedData || [] });
});
exports.getUserFollowingList = getUserFollowingList;
const getAllPeoples = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const followingData = yield prisma_1.default.follow.findMany({
        where: {
            followerId: myId,
        },
        select: {
            followingId: true,
        },
    });
    const followingIds = followingData.map((f) => f.followingId);
    const peoples = yield prisma_1.default.user.findMany({
        where: {
            id: {
                not: Number(myId),
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            about: true,
        },
    });
    const formattedPeoples = peoples.map((person) => (Object.assign(Object.assign({}, person), { isFollowing: followingIds.includes(person.id) })));
    return (0, response_1.responseReturn)(res, 200, { peoples: formattedPeoples });
});
exports.getAllPeoples = getAllPeoples;
const getMyNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const notifications = yield prisma_1.default.notifiction.findMany({
        where: {
            user_id: myId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            user: true,
        },
    });
    return (0, response_1.responseReturn)(res, 200, { notifications });
});
exports.getMyNotifications = getMyNotifications;
const getMyNotificationsCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const notificationsCount = yield prisma_1.default.notifiction.count({
        where: {
            user_id: myId,
            isSeen: false,
        },
    });
    return (0, response_1.responseReturn)(res, 200, { notificationsCount });
});
exports.getMyNotificationsCount = getMyNotificationsCount;
const seenNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    yield prisma_1.default.notifiction.updateMany({
        where: {
            user_id: myId,
        },
        data: {
            isSeen: true,
        },
    });
    const notificationsCount = yield prisma_1.default.notifiction.count({
        where: {
            user_id: myId,
        },
    });
    if (notificationsCount > 12) {
        const notificationsToDelete = yield prisma_1.default.notifiction.findMany({
            where: {
                user_id: myId,
                isSeen: true,
            },
            orderBy: {
                created_at: "desc",
            },
            skip: 12,
        });
        const notificationIdsToDelete = notificationsToDelete.map((notification) => notification.id);
        yield prisma_1.default.notifiction.deleteMany({
            where: {
                id: { in: notificationIdsToDelete },
            },
        });
        return (0, response_1.responseReturn)(res, 200, { success: true });
    }
});
exports.seenNotification = seenNotification;
//# sourceMappingURL=user.js.map