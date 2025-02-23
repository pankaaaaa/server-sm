"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const variables_1 = require("../utils/variables");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: variables_1.GOOGLE_CLIENT_ID,
    clientSecret: variables_1.GOOGLE_CLIENT_SECRET,
    callbackURL: variables_1.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    // Handle user profile information and save it to your database here if needed
    return done(null, profile);
}));
// Serialize and deserialize user for session management
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map