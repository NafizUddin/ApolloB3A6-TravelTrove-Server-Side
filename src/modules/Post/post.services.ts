import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';
import { PostQueryBuilder } from '../../builder/PostQueryBuilder';
import { postSearchableFields } from './post.constant';
import mongoose, { Types } from 'mongoose';

const createPostIntoDB = async (
  payload: Partial<IPost>,
  userData: Record<string, unknown>,
) => {
  const { email } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const postData = { ...payload, postAuthor: user?._id };

  const result = (await Post.create(postData)).populate('postAuthor');
  return result;
};

const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const postQuery = new PostQueryBuilder(
    Post.find().populate('postAuthor'),
    query,
  )
    .search(postSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await postQuery.countTotal();
  const result = await postQuery.modelQuery;

  if (result.length === 0) {
    return null;
  }

  return { meta, result };
};

const addPostUpvoteIntoDB = async (
  postId: string,
  userData: Record<string, unknown>,
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");
  }

  const userId = new Types.ObjectId(_id as string);

  // Check if the user's ObjectId is in the upvote array
  if (post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User has already upvoted this post!',
    );
  }

  // // Check if the user's ObjectId is in the downvote array
  // if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'User has already downvoted this post!',
  //   );
  // }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { upvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('upvote');

    await User.findByIdAndUpdate(
      _id,
      { $inc: { totalUpvote: 1 } },
      { new: true, session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    await session.endSession();
  }
};

const removePostUpvoteFromDB = async (
  postId: string,
  userData: Record<string, unknown>,
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");
  }

  const userId = new Types.ObjectId(_id as string);

  // Check if the user's ObjectId is in the upvote array
  if (!post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User doesn't exist in upvote collection!",
    );
  }

  // // Check if the user's ObjectId is in the downvote array
  // if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'User has already downvoted this post!',
  //   );
  // }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $pull: { upvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('upvote');

    await User.findByIdAndUpdate(
      _id,
      { $inc: { totalUpvote: -1 } },
      { new: true, session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    await session.endSession();
  }
};

// const getSingleServiceFromDB = async (id: string) => {
//   const singleService = await CarService.findById(id);

//   if (singleService?.isDeleted) {
//     return null;
//   } else {
//     return singleService;
//   }
// };

// const updateServiceIntoDB = async (
//   payload: Partial<ICarService>,
//   id: string,
// ) => {
//   const result = await CarService.findByIdAndUpdate(id, payload, {
//     new: true,
//   });

//   return result;
// };

// const deleteServiceFromDB = async (id: string) => {
//   const result = await CarService.findByIdAndUpdate(
//     id,
//     {
//       isDeleted: true,
//     },
//     {
//       new: true,
//     },
//   );

//   return result;
// };

export const PostServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  addPostUpvoteIntoDB,
  removePostUpvoteFromDB,
  //   getSingleServiceFromDB,
  //   updateServiceIntoDB,
  //   deleteServiceFromDB,
};
