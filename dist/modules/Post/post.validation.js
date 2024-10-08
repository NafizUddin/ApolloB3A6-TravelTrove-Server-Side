"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidations = void 0;
const zod_1 = require("zod");
const createPostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string({
            required_error: 'Post title is required',
            invalid_type_error: 'Post title must be a string',
        })
            .trim(),
        category: zod_1.z.enum([
            'Adventure',
            'Business Travel',
            'Exploration',
            'Family Travel',
            'Luxury Travel',
            'Budget Travel',
        ]),
        description: zod_1.z
            .string({
            required_error: 'Post description is required',
            invalid_type_error: 'Post description must be a string',
        })
            .trim(),
        image: zod_1.z.string().url('Image URL is required and must be valid'),
        status: zod_1.z
            .string({
            required_error: 'Post status is required',
        })
            .trim(),
    }),
});
const updatePostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string({
            required_error: 'Post title is required',
            invalid_type_error: 'Post title must be a string',
        })
            .trim()
            .optional(),
        category: zod_1.z
            .enum([
            'Adventure',
            'Business Travel',
            'Exploration',
            'Family Travel',
            'Luxury Travel',
            'Budget Travel',
        ])
            .optional(),
        description: zod_1.z
            .string({
            required_error: 'Post description is required',
            invalid_type_error: 'Post description must be a string',
        })
            .trim()
            .optional(),
        image: zod_1.z.string().url('Image URL is required and must be valid').optional(),
        status: zod_1.z
            .string({
            required_error: 'Post status is required',
        })
            .trim()
            .optional(),
    }),
});
exports.PostValidations = {
    createPostValidationSchema,
    updatePostValidationSchema,
};
