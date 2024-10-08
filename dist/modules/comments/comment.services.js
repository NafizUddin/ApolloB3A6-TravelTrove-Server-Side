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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const appError_1 = __importDefault(require("../../errors/appError"));
const user_model_1 = require("../User/user.model");
const comment_model_1 = require("./comment.model");
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const createCommentIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = payload, remaining = __rest(payload, ["email"]);
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const result = (yield comment_model_1.Comment.create(remaining)).populate([
        { path: 'user' },
        { path: 'post' },
    ]);
    return result;
});
const getPostAllCommentsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const commentQuery = new QueryBuilder_1.QueryBuilder(comment_model_1.Comment.find().populate([{ path: 'user' }, { path: 'post' }]), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield commentQuery.countTotal();
    const result = yield commentQuery.modelQuery;
    if (result.length === 0) {
        return null;
    }
    return { meta, result };
});
const updatePostCommentIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.Comment.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deletePostCommentFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.Comment.findByIdAndDelete(id);
    return result;
});
exports.CommentServices = {
    createCommentIntoDB,
    getPostAllCommentsFromDB,
    updatePostCommentIntoDB,
    deletePostCommentFromDB,
};
