"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoutes = void 0;
const express_1 = __importDefault(require("express"));
const post_validation_1 = require("./post.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const post_controller_1 = require("./post.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(post_validation_1.PostValidations.createPostValidationSchema), post_controller_1.PostControllers.createPost);
router.post('/:postId/upvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.addPostUpvote);
router.post('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.addPostDownvote);
router.delete('/:postId/upvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.removePostUpvote);
router.delete('/:postId/downvote', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.removePostDownvote);
router.get('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.getSinglePost);
router.put('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), (0, validateRequest_1.default)(post_validation_1.PostValidations.updatePostValidationSchema), post_controller_1.PostControllers.updatePost);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.ADMIN, user_constant_1.USER_ROLE.USER), post_controller_1.PostControllers.deletePost);
router.get('/', post_controller_1.PostControllers.getAllPosts);
router.get('/dashboard/users', (0, auth_1.default)(user_constant_1.USER_ROLE.USER, user_constant_1.USER_ROLE.ADMIN), post_controller_1.PostControllers.getAllPostsInDashboard);
exports.PostRoutes = router;
