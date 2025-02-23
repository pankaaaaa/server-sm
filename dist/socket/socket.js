"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = exports.getReceiverSocketIds = exports.getReceiverSocketId = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const variables_1 = require("../utils/variables");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [variables_1.CLIENT_URL],
        methods: ["GET", "POST"],
    },
});
exports.io = io;
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};
exports.getReceiverSocketId = getReceiverSocketId;
const getReceiverSocketIds = (receiverIds) => {
    const socket_users_ids = [];
    for (const property in userSocketMap) {
        for (let i = 0; i <= receiverIds.length; i++) {
            const id = receiverIds[i];
            if (userSocketMap[property] === id) {
                socket_users_ids.push(userSocketMap[property]);
            }
        }
    }
    return socket_users_ids;
};
exports.getReceiverSocketIds = getReceiverSocketIds;
const userSocketMap = {}; // {userId: socketId}
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId != "undefined")
        userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
//# sourceMappingURL=socket.js.map