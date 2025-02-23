"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("#/controllers/admin");
const authMiddleware_1 = require("#/middleware/authMiddleware");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/change-password", authMiddleware_1.authMiddleware, admin_1.changePassword);
router.post("/delete-user/:id", authMiddleware_1.authMiddleware, admin_1.deleteUser);
router.get("/dashboard", authMiddleware_1.authMiddleware, admin_1.getDashboardData);
router.get("/get-all-users", authMiddleware_1.authMiddleware, admin_1.getAllUsers);
router.get("/get-popular-users", authMiddleware_1.authMiddleware, admin_1.popularUsers);
exports.default = router;
//# sourceMappingURL=admin.route.js.map