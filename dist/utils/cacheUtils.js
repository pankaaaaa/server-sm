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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.cachePostComment = cachePostComment;
exports.getCachePostComment = getCachePostComment;
exports.invalidatePostCommentCache = invalidatePostCommentCache;
// import { promisify } from "util";
// const setAsync = promisify(redisClient.set).bind(redisClient);
// const getAsync = promisify(redisClient.get).bind(redisClient);
// const delAsync = promisify(redisClient.del).bind(redisClient);
function connectRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        // if (!redisClient.isOpen) {
        //   await redisClient.connect();
        // }
    });
}
// Cache user profile data
function cachePostComment(postId, commentData) {
    return __awaiter(this, void 0, void 0, function* () {
        // await connectRedis();
        // const key = `post:${postId}:comments`;
        // await setAsync(key, JSON.stringify(commentData), "EX", 3600); // Expire after 1 hour
        // // await redisClient.set(key, JSON.stringify(commentData), "EX", 3600); // Expire after 1 hour
        // console.log(`Comment for post ${postId} cached.`);
    });
}
// Fetch user profile from cache
function getCachePostComment(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        // await connectRedis();
        // const key = `post:${postId}:comments`;
        // // const commentData = await redisClient.get(key);
        // const commentData = await getAsync(key);
        // if (commentData) {
        //   return JSON.parse(commentData);
        // } else {
        //   console.log(`No cached comments for post ${postId}.`);
        //   return null;
        // }
    });
}
// Invalidate user profile cache
function invalidatePostCommentCache(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        // await connectRedis();
        // const key = `post:${postId}:comments`;
        // await redisClient.del(key);
        // console.log(`Cache for comments of post ${postId} invalidated.`);
    });
}
//# sourceMappingURL=cacheUtils.js.map