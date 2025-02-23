"use strict";
// const jwt = require("jsonwebtoken");
// import { RequestHandler } from "express";
// export const authMiddleware: RequestHandler = async (req, res, next) => {
//   const { authorization } = req.headers;
//   const token = authorization?.split("Bearer ")[1];
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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    const token = authorization === null || authorization === void 0 ? void 0 : authorization.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ error: "Please login first" });
    }
    try {
        const decodeToken = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        // Initialize user object with proper typing
        req.user = {
            id: decodeToken.id,
            name: decodeToken.name,
            email: "", // Add actual email from token if available
            role: decodeToken.role,
            avatar: decodeToken.avatar,
            backgroundImage: decodeToken.backgroundImage
        };
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map