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
exports.UserServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const appError_1 = __importDefault(require("../../errors/appError"));
const user_constant_1 = require("./user.constant");
const user_model_1 = require("./user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const payment_1 = require("../../utils/payment");
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query)
        .search(user_constant_1.UserSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const meta = yield userQuery.countTotal();
    const result = yield userQuery.modelQuery;
    if (result.length === 0) {
        return null;
    }
    return { meta, result };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    return user;
});
const addFollowingIntoDB = (followedId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const isAlreadyFollowing = yield user_model_1.User.findOne({
        _id,
        following: followedId,
    });
    if (isAlreadyFollowing) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'User is already following this profile!');
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield user_model_1.User.findByIdAndUpdate(_id, { $addToSet: { following: followedId } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('following');
        yield user_model_1.User.findByIdAndUpdate(followedId, { $addToSet: { followers: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('followers');
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const removeFollowingFromDB = (followedId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const isAlreadyFollowing = yield user_model_1.User.findOne({
        _id,
        following: followedId,
    });
    if (!isAlreadyFollowing) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'User is not following this profile!');
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield user_model_1.User.findByIdAndUpdate(_id, { $pull: { following: followedId } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('following');
        yield user_model_1.User.findByIdAndUpdate(followedId, { $pull: { followers: _id } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true, session }).populate('followers');
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const updateUserIntoDB = (payload, id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const startPremiumIntoDB = (payload, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const updatedUserInfo = Object.assign(Object.assign({}, payload), { status: user_constant_1.USER_STATUS.PREMIUM, isVerified: true });
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield user_model_1.User.findByIdAndUpdate(_id, updatedUserInfo, {
            new: true,
        });
        const paymentData = {
            transactionId: payload === null || payload === void 0 ? void 0 : payload.transactionId,
            amount: payload === null || payload === void 0 ? void 0 : payload.premiumCharge,
            customerName: user.name,
            customerEmail: user.email,
        };
        const paymentSession = yield (0, payment_1.initiatePayment)(paymentData);
        yield session.commitTransaction();
        yield session.endSession();
        return { paymentSession, result };
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
exports.UserServices = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    addFollowingIntoDB,
    removeFollowingFromDB,
    updateUserIntoDB,
    startPremiumIntoDB,
};
