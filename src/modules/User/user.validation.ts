import { z } from 'zod';
import { USER_ROLE, USER_STATUS } from './user.constant';

// const createUserValidationSchema = z.object({
//   body: z.object({
//     name: z.string({
//       required_error: 'Name is required',
//     }),
//     role: z.nativeEnum(USER_ROLE),
//     email: z
//       .string({
//         required_error: 'Email is required',
//       })
//       .email({
//         message: 'Invalid email',
//       }),
//     password: z.string({
//       required_error: 'Password is required',
//     }),
//     status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
//   }),
// });

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.nativeEnum(USER_ROLE).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    profilePhoto: z
      .string()
      .url('Image URL is required and must be valid')
      .optional(),
  }),
});

export const UserValidation = {
  // createUserValidationSchema,
  updateUserValidationSchema,
};
