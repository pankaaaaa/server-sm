"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const groupChat_1 = require("#/controllers/groupChat");
const authMiddleware_1 = require("#/middleware/authMiddleware");
const validator_1 = require("#/middleware/validator");
const validationSchema_1 = require("#/utils/validationSchema");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/send-group-message/:chatId", authMiddleware_1.authMiddleware, groupChat_1.sendGroupMessage);
router.get("/get-my-group-chats", authMiddleware_1.authMiddleware, groupChat_1.getUserGroupChats);
router.post("/create-group", (0, validator_1.validate)(validationSchema_1.CreateGroupSchema), authMiddleware_1.authMiddleware, groupChat_1.createGroupChat);
router.put("/update-group/:id", (0, validator_1.validate)(validationSchema_1.UpdateGroupSchema), authMiddleware_1.authMiddleware, groupChat_1.updateGroupChat);
router.get("/get-group-chat-messages/:chatId", authMiddleware_1.authMiddleware, groupChat_1.getGroupChatMessage);
router.get("/get-group-chat/:id", authMiddleware_1.authMiddleware, groupChat_1.getGroupChatInfo);
exports.default = router;
//# sourceMappingURL=groupChat.route.js.map