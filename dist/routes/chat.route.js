"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_1 = require("../controllers/chat");
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/search", authMiddleware_1.authMiddleware, chat_1.serachUser);
router.post("/send-message", authMiddleware_1.authMiddleware, chat_1.sendMessage);
router.get("/get-my-chats", authMiddleware_1.authMiddleware, chat_1.getUserChats);
router.get("/get-chat-messages/:chatId", authMiddleware_1.authMiddleware, chat_1.getChatMessage);
router.get("/other-user-chat-with-me/:userId", authMiddleware_1.authMiddleware, chat_1.getOtherUserChatWithMe);
exports.default = router;
//# sourceMappingURL=chat.route.js.map