"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordSchema = exports.UpdateGroupSchema = exports.CreateGroupSchema = exports.AddReplayToReplayCommentSchema = exports.AddCommentSchema = exports.UpVoteDownVoteSchema = exports.UpdatePostSchema = exports.CreatePostSchema = exports.UpdateUserSchema = exports.SignInValidationSchema = exports.CreateUserSchema = void 0;
const yup = __importStar(require("yup"));
exports.CreateUserSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required("Name is missing")
        .min(3, "Name is too short!")
        .max(20, "Name is to long!"),
    email: yup.string().required("Email is missing!").email("Invalid email id!"),
    password: yup
        .string()
        .trim()
        .required("Password is missing!")
        .min(5, "password is too short!"),
});
exports.SignInValidationSchema = yup.object().shape({
    email: yup.string().required("Email is missing!").email("Invalid email id!"),
    password: yup.string().trim().required("Password is missing!"),
});
exports.UpdateUserSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .min(3, "Name is too short!")
        .max(20, "Name is to long!")
        .optional(),
    github: yup
        .string()
        .trim()
        .test("is-optional-url", 'GitHub URL must start with "https://github.com/"', (value) => value === "" ||
        value === undefined ||
        value === null ||
        /^https:\/\/github\.com\//.test(value))
        .optional(),
    twitter: yup
        .string()
        .trim()
        .test("is-optional-url", 'Twitter URL must start with "https://x.com/"', (value) => value === "" ||
        value === undefined ||
        value === null ||
        /^https:\/\/x\.com\//.test(value))
        .optional(),
    about: yup.string().trim().min(3, "About is too short!").optional(),
    avatar: yup.string().optional(),
    backgroundImage: yup.string().optional(),
});
exports.CreatePostSchema = yup.object().shape({
    title: yup
        .string()
        .trim()
        .min(3, "title is too short!")
        .max(70, "title is to long!"),
    image: yup.string().trim().optional(),
    visibility: yup.string().trim(),
});
exports.UpdatePostSchema = yup.object().shape({
    title: yup.string().trim().optional(),
    image: yup.string().trim().optional(),
    visibility: yup.string().trim().optional(),
});
exports.UpVoteDownVoteSchema = yup.object().shape({
    vote: yup
        .string()
        .trim()
        .min(3, "vote is required!")
        .equals(["up-vote", "down-vote"]),
});
exports.AddCommentSchema = yup.object().shape({
    text: yup.string().trim().min(1, "text is required!"),
});
exports.AddReplayToReplayCommentSchema = yup.object().shape({
    text: yup.string().trim().min(1, "text is required!"),
    replayToAuthorId: yup.number().min(1, "replay to author id is required!"),
    replayToCommentId: yup.number().min(1, "replay to author id is required!"),
});
exports.CreateGroupSchema = yup.object().shape({
    title: yup.string().trim().min(1, "text is required!"),
    users: yup.array(),
    avatar: yup.string().optional(),
});
exports.UpdateGroupSchema = yup.object().shape({
    title: yup.string().optional(),
    users: yup.array().optional(),
    avatar: yup.string().optional(),
});
exports.UpdatePasswordSchema = yup.object().shape({
    newPassword: yup.string(),
    oldPassword: yup.string(),
});
//# sourceMappingURL=validationSchema.js.map