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
const redis_1 = require("redis");
const variables_1 = require("./utils/variables");
let redisClient;
try {
    redisClient = (0, redis_1.createClient)({
        password: variables_1.REDIS_PASSWORD,
        socket: {
            host: variables_1.REDIS_HOST,
            port: 12199,
        },
    });
    console.log("Redis client initialized.");
    redisClient === null || redisClient === void 0 ? void 0 : redisClient.on("connect", () => {
        console.log("Redis client connecting...");
    });
    redisClient === null || redisClient === void 0 ? void 0 : redisClient.on("ready", () => {
        console.log("Redis client connected and ready!");
    });
    redisClient === null || redisClient === void 0 ? void 0 : redisClient.on("error", (err) => {
        console.error("Redis client error:", err);
    });
    redisClient === null || redisClient === void 0 ? void 0 : redisClient.on("end", () => {
        console.log("Redis client disconnected.");
    });
}
catch (error) {
    console.error("Error initializing Redis client:", error);
}
function connectRedisClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(redisClient === null || redisClient === void 0 ? void 0 : redisClient.isOpen)) {
            try {
                yield redisClient.connect();
                console.log("Redis client connected successfully.");
            }
            catch (err) {
                console.error("Failed to connect to Redis:", err);
            }
        }
    });
}
// Call the connectRedisClient function to ensure the connection
connectRedisClient().catch(console.error);
exports.default = redisClient;
//# sourceMappingURL=redis.js.map