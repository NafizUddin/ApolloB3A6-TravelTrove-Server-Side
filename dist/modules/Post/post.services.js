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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PostServices = void 0;
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const appError_1 = __importDefault(require("../../errors/appError"));
const user_model_1 = require("../User/user.model");
const post_model_1 = require("./post.model");
const mongoose_1 = __importStar(require("mongoose"));
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const createPostIntoDB = (payload, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const postData = Object.assign(Object.assign({}, payload), { postAuthor: user === null || user === void 0 ? void 0 : user._id });
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const [createdPost] = yield post_model_1.Post.create([Object.assign({}, postData)], { session });
        const result = yield createdPost.populate([{ path: 'postAuthor' }]);
        yield user_model_1.User.findByIdAndUpdate(user._id, { $inc: { postCount: 1 } }, { new: true, session });
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const getAllPostsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { sort, searchTerm, page = 1, limit = 5, category } = query, searchQuery = __rest(query, ["sort", "searchTerm", "page", "limit", "category"]);
    const skip = (Number(page) - 1) * Number(limit);
    // Base aggregation pipeline
    const aggregationPipeline = [
        {
            $lookup: {
                from: 'users', // from 'users' collection
                localField: 'postAuthor',
                foreignField: '_id',
                as: 'postAuthor',
            },
        },
        {
            $unwind: {
                path: '$postAuthor',
                preserveNullAndEmptyArrays: true, // Keep posts without an author
            },
        },
        {
            $addFields: {
                upvoteCount: { $size: '$upvote' },
                downvoteCount: { $size: '$downvote' },
            },
        },
    ];
    // Add search filter if searchTerm is provided
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        aggregationPipeline.push({
            $match: {
                $or: [
                    { title: searchRegex },
                    { category: searchRegex },
                    { 'postAuthor.name': searchRegex },
                ],
            },
        });
    }
    // Add category filter if category is provided
    if (category) {
        aggregationPipeline.push({
            $match: { category: category } // Adjust this as needed for your filtering logic
        });
    }
    // Add sorting logic
    if (sort === 'upvote' || sort === 'downvote') {
        aggregationPipeline.push({
            $sort: sort === 'upvote' ? { upvoteCount: -1 } : { downvoteCount: 1 },
        });
    }
    else {
        aggregationPipeline.push({
            $sort: { createdAt: -1 },
        });
    }
    // Add pagination to the pipeline
    aggregationPipeline.push({ $skip: skip }, { $limit: Number(limit) });
    const result = yield post_model_1.Post.aggregate(aggregationPipeline);
    if (!result || result.length === 0) {
        return null;
    }
    return { result };
});
const addPostUpvoteIntoDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const post = yield post_model_1.Post.findById(postId);
    if (!post) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    }
    const userId = new mongoose_1.Types.ObjectId(_id);
    // Check if the user's ObjectId is in the upvote array
    if (post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'User has already upvoted this post!');
    }
    // // Check if the user's ObjectId is in the downvote array
    // if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
    //   throw new AppError(
    //     httpStatus.BAD_REQUEST,
    //     'User has already downvoted this post!',
    //   );
    // }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // Check if the user's ObjectId is in the downvote array
        if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
            yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { downvote: _id } }, // Use $pull to avoid duplicates
            { new: true, runValidators: true, session });
        }
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $addToSet: { upvote: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('upvote');
        yield user_model_1.User.findByIdAndUpdate(post.postAuthor._id, { $inc: { totalUpvote: 1 } }, { new: true, session });
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const removePostUpvoteFromDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const post = yield post_model_1.Post.findById(postId);
    if (!post) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    }
    const userId = new mongoose_1.Types.ObjectId(_id);
    // Check if the user's ObjectId is in the upvote array
    if (!post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "User doesn't exist in upvote collection!");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { upvote: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('upvote');
        yield user_model_1.User.findByIdAndUpdate(post.postAuthor._id, { $inc: { totalUpvote: -1 } }, { new: true, session });
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const addPostDownvoteIntoDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const post = yield post_model_1.Post.findById(postId);
    if (!post) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    }
    const userId = new mongoose_1.Types.ObjectId(_id);
    // Check if the user's ObjectId is in the upvote array
    if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'User has already downvoted this post!');
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        if (post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
            yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { upvote: _id } }, // Use $pull to avoid duplicates
            { new: true, runValidators: true, session });
        }
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $addToSet: { downvote: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('downvote');
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const removePostDownvoteFromDB = (postId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const post = yield post_model_1.Post.findById(postId);
    if (!post) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Post doesn't exist!");
    }
    const userId = new mongoose_1.Types.ObjectId(_id);
    // Check if the user's ObjectId is in the upvote array
    if (!post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "User doesn't exist in downvote collection!");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield post_model_1.Post.findByIdAndUpdate(postId, { $pull: { downvote: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('downvote');
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const getSinglePostFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const singlePost = yield post_model_1.Post.findById(id).populate('postAuthor');
    if (!singlePost) {
        return null;
    }
    else {
        return singlePost;
    }
});
const getAllPostsInDashboard = (query, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const postQuery = new QueryBuilder_1.QueryBuilder(post_model_1.Post.find().populate('postAuthor'), query)
        .filter()
        .sort()
        .paginate();
    const meta = yield postQuery.countTotal();
    const result = yield postQuery.modelQuery;
    if (result.length === 0) {
        return null;
    }
    return { meta, result };
});
const updatePostIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield post_model_1.Post.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deletePostFromDB = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield post_model_1.Post.findByIdAndDelete(id);
        yield user_model_1.User.findByIdAndUpdate(_id, { $inc: { postCount: -1 } }, { new: true, session });
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
exports.PostServices = {
    createPostIntoDB,
    getAllPostsFromDB,
    addPostUpvoteIntoDB,
    removePostUpvoteFromDB,
    addPostDownvoteIntoDB,
    removePostDownvoteFromDB,
    getSinglePostFromDB,
    getAllPostsInDashboard,
    updatePostIntoDB,
    deletePostFromDB,
};
