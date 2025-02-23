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
const express_1 = __importDefault(require("express"));
require("dotenv/config");
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const post_route_1 = __importDefault(require("./routes/post.route"));
const groupChat_route_1 = __importDefault(require("./routes/groupChat.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const express_session_1 = __importDefault(require("express-session"));
const error_1 = require("./middleware/error");
const socket_1 = require("./socket/socket");
socket_1.app.set("trust proxy", 1);
const variables_1 = require("./utils/variables");
const prisma_1 = __importDefault(require("./prisma/prisma"));
const passport = require("passport");
require("./providers/google")(passport);
require("./providers/github")(passport);
socket_1.app.use((0, express_session_1.default)({
    secret: variables_1.GOOGLE_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
// Initialize Passport middleware
socket_1.app.use(passport.initialize());
socket_1.app.use(passport.session({
    secret: variables_1.GOOGLE_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
}));
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// get user info
passport.deserializeUser(function (id, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma_1.default.user.findFirst({ where: { id } });
            if (user) {
                done(null, user);
            }
            else {
                done(new Error("User not found"), null);
            }
        }
        catch (error) {
            done(error, null);
        }
    });
});
socket_1.app.use((0, cors_1.default)({
    origin: "*",
    // origin:[CLIENT_URL],
}));
socket_1.app.use(express_1.default.json());
socket_1.app.use(express_1.default.urlencoded({ extended: true }));
socket_1.app.get("/", (req, res) => {
    return res.json("Hello World");
});
socket_1.app.use("/api/auth", auth_route_1.default);
socket_1.app.use("/api/chat", chat_route_1.default);
socket_1.app.use("/api/user", user_route_1.default);
socket_1.app.use("/api/post", post_route_1.default);
socket_1.app.use("/api/group-chat", groupChat_route_1.default);
socket_1.app.use("/api/admin", admin_route_1.default);
socket_1.app.use(error_1.errorHandler);
const PORT_IN_USE = variables_1.PORT || 5000;
socket_1.server.listen(PORT_IN_USE, () => {
    console.log("Server is listing on port " + PORT_IN_USE);
});
//# sourceMappingURL=index.js.map