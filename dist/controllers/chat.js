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
exports.getOtherUserChatWithMe = exports.getChatMessage = exports.getUserChats = exports.sendMessage = exports.serachUser = void 0;
const prisma_1 = __importDefault(require("../prisma/prisma"));
const response_1 = require("../utils/response");
const socket_1 = require("../socket/socket");
const serachUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const searchValue = req.query.search;
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
    if (!searchValue ||
        Array.isArray(searchValue) ||
        typeof searchValue !== "string") {
        return res.status(400).json({ error: "A valid search query is required" });
    }
    const chatUserIds = chats.flatMap((chat) => chat.friends.map((friend) => friend.id));
    const excludeUserIds = [...chatUserIds, myId];
    const users = yield prisma_1.default.user.findMany({
        where: {
            id: {
                notIn: excludeUserIds,
            },
            name: {
                contains: searchValue,
                mode: "insensitive",
            },
        },
        take: 10,
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            about: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, users);
});
exports.serachUser = serachUser;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id: myId } = req.user;
    const receiverId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.receiverId;
    const message = req.body.message;
    const imageUrl = req.body.imageUrl;
    const existingChat = yield prisma_1.default.chat.findFirst({
        where: {
            AND: [
                {
                    friends: {
                        some: {
                            id: myId,
                        },
                    },
                },
                {
                    friends: {
                        some: {
                            id: parseInt(receiverId),
                        },
                    },
                },
            ],
        },
    });
    let newMessage;
    let chat;
    if (!existingChat) {
        // new chat
        chat = yield prisma_1.default.chat.create({
            data: {
                lastMessage: message,
                senderId: myId,
                friends: {
                    connect: [{ id: myId }, { id: receiverId }],
                },
            },
            include: {
                friends: true,
            },
        });
        const ewMessage = yield prisma_1.default.message.create({
            data: {
                text: message,
                chat_id: chat.id,
                senderId: myId,
                imageUrl,
            },
        });
    }
    else {
        newMessage = yield prisma_1.default.message.create({
            data: {
                text: message,
                chat_id: existingChat.id,
                senderId: myId,
                imageUrl,
            },
        });
        chat = yield prisma_1.default.chat.update({
            where: {
                id: existingChat.id,
            },
            data: {
                lastMessage: message,
            },
            include: {
                friends: true,
            },
        });
    }
    const receiverSocketId = (0, socket_1.getReceiverSocketId)(receiverId);
    if (receiverSocketId) {
        socket_1.io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    if (receiverSocketId) {
        socket_1.io.to(receiverSocketId).emit("newChatNotification", {
            text: newMessage.text,
            senderInfo: req.user,
        });
    }
    (0, response_1.responseReturn)(res, 201, {
        message: "Message send successfully",
        chat: chat,
    });
});
exports.sendMessage = sendMessage;
const getUserChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    name: true,
                    id: true,
                    avatar: true,
                },
            },
            lastMessage: true,
            senderId: true,
            id: true,
        },
        orderBy: {
            updated_at: "desc",
        },
    });
    (0, response_1.responseReturn)(res, 201, chats);
});
exports.getUserChats = getUserChats;
const getChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const messages = yield prisma_1.default.message.findMany({
        where: {
            chat_id: parseInt(chatId),
        },
    });
    (0, response_1.responseReturn)(res, 201, messages);
});
exports.getChatMessage = getChatMessage;
const getOtherUserChatWithMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { id: myId } = req.user;
    const chat = yield prisma_1.default.chat.findFirst({
        where: {
            AND: [
                {
                    friends: {
                        some: {
                            id: myId,
                        },
                    },
                },
                {
                    friends: {
                        some: {
                            id: parseInt(userId),
                        },
                    },
                },
            ],
        },
    });
    (0, response_1.responseReturn)(res, 201, chat);
});
exports.getOtherUserChatWithMe = getOtherUserChatWithMe;
//# sourceMappingURL=chat.js.map