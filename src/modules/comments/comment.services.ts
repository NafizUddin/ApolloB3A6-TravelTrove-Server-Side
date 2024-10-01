import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';

const createCommentIntoDB = async (payload: Partial<IComment>) => {
  const { email, ...remaining } = payload;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const result = (await Comment.create(remaining)).populate([
    { path: 'user' },
    { path: 'post' },
  ]);

  return result;
};

export const CommentServices = {
  createCommentIntoDB,
};
