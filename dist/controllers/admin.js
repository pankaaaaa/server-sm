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
exports.changePassword = exports.deleteUser = exports.popularUsers = exports.getAllUsers = exports.getDashboardData = void 0;
const prisma_1 = __importDefault(require("#/prisma/prisma"));
const response_1 = require("#/utils/response");
const date_fns_1 = require("date-fns");
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userCount = yield prisma_1.default.user.count();
        const postCount = yield prisma_1.default.post.count();
        const startDate = (0, date_fns_1.subMonths)(new Date(), 6);
        const usersRegisteredOnDates = yield prisma_1.default.user.groupBy({
            by: ["created_at"],
            _count: {
                id: true,
            },
            where: {
                created_at: {
                    gte: startDate,
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });
        const postRegisteredOnDates = yield prisma_1.default.post.groupBy({
            by: ["created_at"],
            _count: {
                id: true,
            },
            where: {
                created_at: {
                    gte: startDate,
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });
        const formattedPostRegistrations = postRegisteredOnDates.reduce((acc, entry) => {
            const date = (0, date_fns_1.format)(entry.created_at, "yyyy-MM-dd");
            const existingEntry = acc.find((item) => item.date === date);
            if (existingEntry) {
                existingEntry.registers += entry._count.id;
            }
            else {
                acc.push({ date, registers: entry._count.id });
            }
            return acc;
        }, []);
        const formattedUserRegistrations = usersRegisteredOnDates.reduce((acc, entry) => {
            const date = (0, date_fns_1.format)(entry.created_at, "yyyy-MM-dd");
            const existingEntry = acc.find((item) => item.date === date);
            if (existingEntry) {
                existingEntry.registers += entry._count.id;
            }
            else {
                acc.push({ date, registers: entry._count.id });
            }
            return acc;
        }, []);
        const dateMap = {};
        formattedUserRegistrations.forEach(({ date, registers }) => {
            if (!dateMap[date]) {
                dateMap[date] = { users: 0, posts: 0 };
            }
            dateMap[date].users = registers;
        });
        formattedPostRegistrations.forEach(({ date, registers }) => {
            if (!dateMap[date]) {
                dateMap[date] = { users: 0, posts: 0 };
            }
            dateMap[date].posts = registers;
        });
        const finalData = Object.entries(dateMap).map(([date, { users, posts }]) => ({
            date,
            users,
            posts,
        }));
        return (0, response_1.responseReturn)(res, 200, {
            userCount,
            postCount,
            chartData: finalData,
        });
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.getDashboardData = getDashboardData;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                followers: {
                    select: {
                        id: true,
                    },
                },
                following: {
                    select: { id: true },
                },
                posts: {
                    select: { id: true },
                },
            },
        });
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar || "",
            email: user.email,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            posts: user.posts.length,
        }));
        return (0, response_1.responseReturn)(res, 200, {
            users: formattedUsers,
        });
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.getAllUsers = getAllUsers;
const popularUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
                about: true,
                followers: {
                    select: {
                        id: true,
                    },
                },
                following: {
                    select: { id: true },
                },
                posts: {
                    select: { id: true },
                },
            },
            orderBy: {
                followers: {
                    _count: "desc",
                },
            },
            take: 10,
        });
        const formattedUsers = users.map((u) => {
            return {
                id: u.id,
                name: u.name,
                avatar: u.avatar,
                email: u.email,
                about: u.about,
                followersCount: u.followers.length,
                followingCount: u.following.length,
                posts: u.posts.length,
            };
        });
        return (0, response_1.responseReturn)(res, 200, {
            users: formattedUsers,
        });
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.popularUsers = popularUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.default.chat.deleteMany({
            where: { senderId: parseInt(id) },
        });
        yield prisma_1.default.user.delete({
            where: { id: parseInt(id) },
        });
        return (0, response_1.responseReturn)(res, 200, {
            message: "user deleted successfully",
        });
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.deleteUser = deleteUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { newPassword, oldPassword } = req.body;
    console.log("newPassword", newPassword);
    try {
        const admin = yield prisma_1.default.adminUser.findFirst({ where: { id } });
        if ((admin === null || admin === void 0 ? void 0 : admin.password) === oldPassword) {
            yield prisma_1.default.adminUser.update({
                where: { id },
                data: {
                    password: newPassword,
                },
            });
            return (0, response_1.responseReturn)(res, 200, {
                message: "password updated successfully",
            });
        }
        else {
            return (0, response_1.responseReturn)(res, 200, {
                message: "old password is wrong",
            });
        }
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.changePassword = changePassword;
//# sourceMappingURL=admin.js.map