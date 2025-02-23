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
exports.admin_get_user = exports.update_password = exports.update_user = exports.admin_login = exports.get_user = exports.user_login = exports.user_register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../utils/response");
const prisma_1 = __importDefault(require("../prisma/prisma"));
const createToken_1 = require("../utils/createToken");
// user register @POST /api/auth/register
const user_register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
    });
    if (user) {
        (0, response_1.responseReturn)(res, 404, { error: "Email Already Exits" });
    }
    else {
        const createUser = yield prisma_1.default.user.create({
            data: {
                name: name,
                email: email,
                password: yield bcrypt_1.default.hash(password, 10),
            },
        });
        const token = yield (0, createToken_1.createToken)({
            id: createUser.id,
            name: createUser.name,
            email: createUser.email,
            role: "user",
            followersCount: 0,
            followingCount: 0,
            about: createUser.about,
            backgroundImage: createUser.backgroundImage,
        });
        (0, response_1.responseReturn)(res, 201, {
            message: "User Register Success",
            token,
            userInfo: {
                name: createUser.name,
                id: createUser.id,
                email: createUser.email,
                role: "user",
                followersCount: 0,
                followingCount: 0,
                about: createUser.about,
            },
        });
    }
});
exports.user_register = user_register;
// End Method
// user login @POST /api/auth/login
const user_login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        include: {
            friends: true,
        },
    });
    if (user) {
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (match) {
            const followersCount = yield prisma_1.default.follow.count({
                where: {
                    followerId: user.id,
                },
            });
            const followingCount = yield prisma_1.default.follow.count({
                where: {
                    followingId: user.id,
                },
            });
            const token = yield (0, createToken_1.createToken)({
                id: user.id,
                name: user.name,
                email: user.email,
                role: "user",
                followersCount,
                followingCount,
                about: user.about,
                avatar: user.avatar,
                backgroundImage: user.backgroundImage,
            });
            (0, response_1.responseReturn)(res, 201, {
                message: "User Login Success",
                token,
                userInfo: {
                    name: user.name,
                    id: user.id,
                    email: user.email,
                    role: "user",
                    followersCount,
                    followingCount,
                    about: user.about,
                    friends: user === null || user === void 0 ? void 0 : user.friends,
                    avatar: user.avatar,
                    backgroundImage: user === null || user === void 0 ? void 0 : user.backgroundImage,
                },
            });
        }
        else {
            (0, response_1.responseReturn)(res, 404, { error: "Password Wrong" });
        }
    }
    else {
        (0, response_1.responseReturn)(res, 404, { error: "Email Not Found" });
    }
});
exports.user_login = user_login;
// End Method
// get user info @GET /api/auth/get-user
const get_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: id,
        },
        include: {
            friends: true,
        },
    });
    if (!user) {
        return (0, response_1.responseReturn)(res, 200, {
            error: "User not found",
        });
    }
    const followersCount = yield prisma_1.default.follow.count({
        where: {
            followerId: user.id,
        },
    });
    const followingCount = yield prisma_1.default.follow.count({
        where: {
            followingId: user.id,
        },
    });
    (0, response_1.responseReturn)(res, 200, {
        userInfo: {
            name: user.name,
            id: user.id,
            email: user.email,
            role: "user",
            followersCount,
            followingCount,
            about: user.about,
            avatar: user.avatar,
            github: (user === null || user === void 0 ? void 0 : user.github) || null,
            twitter: (user === null || user === void 0 ? void 0 : user.twitter) || null,
            friends: user === null || user === void 0 ? void 0 : user.friends,
            backgroundImage: user === null || user === void 0 ? void 0 : user.backgroundImage,
        },
    });
});
exports.get_user = get_user;
// End Method
const admin_login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma_1.default.adminUser.findUnique({
        where: {
            email: email,
        },
    });
    if (user) {
        const match = password === user.password;
        if (match) {
            const token = yield (0, createToken_1.createToken)({
                id: user.id,
                email: user.email,
                role: "admin",
                avatar: user.avatar,
            });
            (0, response_1.responseReturn)(res, 201, {
                message: "User Login Success",
                token,
                userInfo: {
                    id: user.id,
                    email: user.email,
                    role: "admin",
                    avatar: user.avatar,
                },
            });
        }
        else {
            (0, response_1.responseReturn)(res, 404, { error: "Password Wrong" });
        }
    }
    else {
        (0, response_1.responseReturn)(res, 404, { error: "Email Not Found" });
    }
});
exports.admin_login = admin_login;
const update_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { about, name, avatar, github, twitter, backgroundImage } = req.body;
    const { id } = req.user;
    try {
        const user = yield prisma_1.default.user.update({
            data: {
                about: about,
                name: name,
                avatar: avatar,
                github,
                twitter,
                backgroundImage,
            },
            where: {
                id: id,
            },
        });
        if (!user) {
            return (0, response_1.responseReturn)(res, 404, {
                error: "User not found",
            });
        }
        return (0, response_1.responseReturn)(res, 200, {
            message: "User info updated",
            user,
        });
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.update_user = update_user;
const update_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword, oldPassword } = req.body;
    const { id } = req.user;
    try {
        const user = yield prisma_1.default.user.findFirst({ where: { id } });
        if (!user) {
            return (0, response_1.responseReturn)(res, 404, {
                error: "User not found",
            });
        }
        const isMatched = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (isMatched) {
            yield prisma_1.default.user.update({
                where: {
                    id,
                },
                data: { password: yield bcrypt_1.default.hash(newPassword, 10) },
            });
            return (0, response_1.responseReturn)(res, 200, {
                message: "password updated",
            });
        }
        else {
            return (0, response_1.responseReturn)(res, 200, {
                error: "Old password is wrong",
            });
        }
    }
    catch (error) {
        (0, response_1.responseReturn)(res, 404, { error: error.message });
    }
});
exports.update_password = update_password;
const admin_get_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield prisma_1.default.adminUser.findUnique({
        where: {
            id: id,
        },
    });
    if (!user) {
        return (0, response_1.responseReturn)(res, 200, {
            error: "User not found",
        });
    }
    (0, response_1.responseReturn)(res, 200, {
        userInfo: {
            avatar: user.avatar,
            id: user.id,
            email: user.email,
            role: "admin",
        },
    });
});
exports.admin_get_user = admin_get_user;
//# sourceMappingURL=auth.js.map