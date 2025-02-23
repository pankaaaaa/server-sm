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
const rateLimit_1 = require("#/config/rateLimit");
const auth_1 = require("#/controllers/auth");
const authMiddleware_1 = require("#/middleware/authMiddleware");
const validator_1 = require("#/middleware/validator");
const validationSchema_1 = require("#/utils/validationSchema");
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const createToken_1 = require("#/utils/createToken");
const router = (0, express_1.Router)();
// user
router.post("/register", rateLimit_1.authLimiter, (0, validator_1.validate)(validationSchema_1.CreateUserSchema), auth_1.user_register);
router.post("/login", rateLimit_1.authLimiter, (0, validator_1.validate)(validationSchema_1.SignInValidationSchema), auth_1.user_login);
router.get("/get-user", rateLimit_1.authLimiter, authMiddleware_1.authMiddleware, auth_1.get_user);
router.post("/update-password", (0, validator_1.validate)(validationSchema_1.UpdatePasswordSchema), rateLimit_1.authLimiter, authMiddleware_1.authMiddleware, auth_1.update_password);
router.put("/update-user-info", rateLimit_1.authLimiter, (0, validator_1.validate)(validationSchema_1.UpdateUserSchema), authMiddleware_1.authMiddleware, auth_1.update_user);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Successful authentication
    const user = req.user;
    const token = yield (0, createToken_1.createToken)({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "user",
        followersCount: 0,
        followingCount: 0,
        about: user.about,
        backgroundImage: user.backgroundImage,
        avatar: user.avatar,
    });
    res.redirect(`https://swift-rivals-mern.vercel.app/provider-redirect?token=${token}`);
}));
router.get("/github", passport_1.default.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback", passport_1.default.authenticate("github", { failureRedirect: "/" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Successful authentication, redirect to the home page or dashboard
    const user = req.user;
    const token = yield (0, createToken_1.createToken)({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "user",
        followersCount: 0,
        followingCount: 0,
        about: user.about,
        backgroundImage: user.backgroundImage,
        avatar: user.avatar,
    });
    res.redirect(`https://swift-rivals-mern.vercel.app/provider-redirect?token=${token}`);
}));
// admin
router.post("/admin/login", rateLimit_1.authLimiter, auth_1.admin_login);
router.get("/admin/get-user", authMiddleware_1.authMiddleware, auth_1.admin_get_user);
router.get("/get-user", rateLimit_1.authLimiter, authMiddleware_1.authMiddleware, auth_1.get_user);
exports.default = router;
//# sourceMappingURL=auth.route.js.map