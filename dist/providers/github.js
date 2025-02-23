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
const GitHubStrategy = require("passport-github2");
const prisma_1 = __importDefault(require("../prisma/prisma"));
const variables_1 = require("../utils/variables");
const bcrypt_1 = require("bcrypt");
module.exports = function (passport) {
    passport.deserializeUser(function (id, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findFirst({ where: { id: parseInt(id) } });
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
    passport.use(new GitHubStrategy({
        clientID: variables_1.GITHUB_CLIENT_ID,
        clientSecret: variables_1.GITHUB_CLIENT_SECRET,
        callbackURL: variables_1.GITHUB_CALLBACK_URL,
        scope: ["user:email"], // Ensure this is correct
    }, function (_accessToken, _refreshToken, profile, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield prisma_1.default.user.findFirst({
                where: { githubId: String(profile.id), provider: profile.provider },
            });
            if (!user) {
                const name = profile.displayName || profile.username;
                const email = profile.emails && profile.emails.length > 0
                    ? profile.emails[0].value // Get email
                    : null; // Handle case where no email is available
                const newUser = yield prisma_1.default.user.create({
                    data: {
                        name,
                        email,
                        password: yield (0, bcrypt_1.hash)(`${profile.provider}/12345`, 10), // Dummy password
                        githubId: String(profile.id),
                        provider: profile.provider,
                        avatar: (_a = profile.photos[0]) === null || _a === void 0 ? void 0 : _a.value,
                    },
                });
                return cb(null, newUser);
            }
            return cb(null, user);
        });
    }));
};
//# sourceMappingURL=github.js.map