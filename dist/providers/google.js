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
const GoogleStrategy = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("#/prisma/prisma"));
const variables_1 = require("#/utils/variables");
const bcrypt_1 = require("bcrypt");
module.exports = function (passport) {
    passport.deserializeUser(function (id, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma_1.default.user.findFirst({
                    where: { id: parseInt(id) },
                });
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
    passport.use(new GoogleStrategy({
        clientID: variables_1.GOOGLE_CLIENT_ID,
        clientSecret: variables_1.GOOGLE_CLIENT_SECRET,
        callbackURL: variables_1.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
    }, function (_accessToken, _refreshToken, profile, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield prisma_1.default.user.findFirst({
                where: { googleId: String(profile.id), provider: profile.provider },
            });
            if (!user) {
                const name = profile.displayName;
                const newUser = yield prisma_1.default.user.create({
                    data: {
                        name,
                        email: profile._json.email,
                        password: yield (0, bcrypt_1.hash)(`${profile.provider}/12345`, 10),
                        googleId: String(profile.id),
                        provider: profile.provider,
                        avatar: (_a = profile === null || profile === void 0 ? void 0 : profile.photos[0]) === null || _a === void 0 ? void 0 : _a.value,
                    },
                });
                return cb(null, newUser);
            }
            return cb(null, user);
        });
    }));
};
//# sourceMappingURL=google.js.map