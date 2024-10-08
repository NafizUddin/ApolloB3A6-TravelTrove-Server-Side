"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentValidations = void 0;
const zod_1 = require("zod");
const createCommentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        text: zod_1.z
            .string({
            required_error: 'Comment is required',
            invalid_type_error: 'Comment must be a string',
        })
            .trim(),
        user: zod_1.z
            .string({
            required_error: "Comment's User Id is required",
        })
            .trim(),
        post: zod_1.z
            .string({
            required_error: 'Post Id is required',
        })
            .trim(),
        email: zod_1.z
            .string({
            required_error: "Comment's User Email is required",
        })
            .email(),
    }),
});
const updateCommentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        text: zod_1.z
            .string({
            required_error: 'Comment is required',
            invalid_type_error: 'Comment must be a string',
        })
            .trim(),
    }),
});
exports.commentValidations = {
    createCommentValidationSchema,
    updateCommentValidationSchema,
};
