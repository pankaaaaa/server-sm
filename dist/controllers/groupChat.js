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
exports.updateGroupChat = exports.getGroupChatInfo = exports.getGroupChatMessage = exports.sendGroupMessage = exports.getUserGroupChats = exports.createGroupChat = void 0;
const prisma_1 = __importDefault(require("#/prisma/prisma"));
const socket_1 = require("#/socket/socket");
const response_1 = require("#/utils/response");
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { users, title, avatar } = req.body;
    if (!Array.isArray(users)) {
        return (0, response_1.responseReturn)(res, 400, {
            error: "Users must be an array of user IDs",
        });
    }
    users.push({ id: myId });
    yield prisma_1.default.groupChat.create({
        data: {
            lastMessage: `chat created by ${req.user.name}`,
            createdBy: myId,
            title: title,
            avatar: avatar,
            friends: {
                connect: users.map((user) => ({ id: user.id })),
            },
        },
        include: {
            friends: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, { message: "Group is created successfully" });
});
exports.createGroupChat = createGroupChat;
const getUserGroupChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const chats = yield prisma_1.default.groupChat.findMany({
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
            id: true,
            createdBy: true,
            title: true,
            avatar: true,
        },
        orderBy: {
            updated_at: "desc",
        },
    });
    (0, response_1.responseReturn)(res, 201, chats);
});
exports.getUserGroupChats = getUserGroupChats;
const sendGroupMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { chatId } = req.params;
    const message = req.body.message;
    const existingChat = yield prisma_1.default.groupChat.findUnique({
        where: {
            id: parseInt(chatId),
        },
        include: {
            friends: true,
        },
    });
    let newMessage;
    if (!existingChat) {
        return (0, response_1.responseReturn)(res, 401, { error: "chat not found!" });
    }
    newMessage = yield prisma_1.default.groupMessage.create({
        data: {
            text: message,
            group_chat_id: existingChat.id,
            senderId: myId,
        },
    });
    yield prisma_1.default.groupChat.update({
        where: {
            id: existingChat.id,
        },
        data: {
            lastMessage: message,
        },
    });
    newMessage.senderId = myId;
    newMessage.sender = req.user;
    const friends = existingChat.friends.map((friend) => friend.id);
    // SOCKET IO FUNCTIONALITY WILL GO HERE
    const receiverSocketId = (0, socket_1.getReceiverSocketIds)(friends);
    if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        socket_1.io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    (0, response_1.responseReturn)(res, 201, { message: "Message send successfully" });
});
exports.sendGroupMessage = sendGroupMessage;
const getGroupChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const messages = yield prisma_1.default.groupMessage.findMany({
        where: {
            group_chat_id: parseInt(chatId),
        },
        include: {
            sender: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, messages);
});
exports.getGroupChatMessage = getGroupChatMessage;
const getGroupChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const chatInfo = yield prisma_1.default.groupChat.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            friends: true,
        },
    });
    (0, response_1.responseReturn)(res, 201, { chatInfo });
});
exports.getGroupChatInfo = getGroupChatInfo;
const updateGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: myId } = req.user;
    const { id } = req.params;
    const { users, title, avatar } = req.body;
    if (users.length < 2) {
        return (0, response_1.responseReturn)(res, 400, {
            error: "To create group total people must be at least 3",
        });
    }
    users.push({ id: myId });
    yield prisma_1.default.groupChat.update({
        where: {
            id: parseInt(id),
        },
        data: {
            title: title,
            avatar: avatar,
            friends: {
                set: users.map((user) => ({ id: user.id })),
            },
        },
    });
    (0, response_1.responseReturn)(res, 201, { message: "Group is updated successfully" });
});
exports.updateGroupChat = updateGroupChat;
//# sourceMappingURL=groupChat.js.map