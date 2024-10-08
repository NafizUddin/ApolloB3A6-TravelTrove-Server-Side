"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_constant_1 = require("./user.constant");
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        role: zod_1.z.nativeEnum(user_constant_1.USER_ROLE).optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(user_constant_1.USER_STATUS).optional(),
        profilePhoto: zod_1.z
            .string()
            .url('Image URL is required and must be valid')
            .optional(),
    }),
});
const getPremiumValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        transactionId: zod_1.z.string({
            required_error: 'TransactionId is required',
        }),
        paymentStatus: zod_1.z
            .string({
            required_error: 'Payment Status is required',
            invalid_type_error: 'Payment Status must be a string',
        })
            .trim(),
        premiumStart: zod_1.z
            .string({
            required_error: 'Premium Start Date is required',
        })
            .trim(),
        premiumEnd: zod_1.z
            .string({
            required_error: 'Premium End Date is required',
        })
            .trim(),
        premiumCharge: zod_1.z.number().nonnegative().min(1),
    }),
});
exports.UserValidation = {
    updateUserValidationSchema,
    getPremiumValidationSchema,
};
