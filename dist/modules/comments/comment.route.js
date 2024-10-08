"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_constant_1 = require("../User/user.constant");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const comment_validation_1 = require("./comment.validation");
const comment_controller_1 = require("./comment.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), (0, validateRequest_1.default)(comment_validation_1.commentValidations.createCommentValidationSchema), comment_controller_1.CommentControllers.createComment);
router.put('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), (0, validateRequest_1.default)(comment_validation_1.commentValidations.updateCommentValidationSchema), comment_controller_1.CommentControllers.updatePostComment);
router.delete('/:id', (0, auth_1.default)(user_constant_1.USER_ROLE.USER), comment_controller_1.CommentControllers.deletePostComment);
router.get('/', comment_controller_1.CommentControllers.getPostAllComments);
exports.CommentRoutes = router;
