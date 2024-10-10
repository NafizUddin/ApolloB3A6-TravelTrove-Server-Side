/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/appError';
import { User } from '../User/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';
import mongoose, { Types } from 'mongoose';
import { QueryBuilder } from '../../builder/QueryBuilder';

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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [createdPost] = await Post.create([{ ...postData }], { session });

    const result = await createdPost.populate([{ path: 'postAuthor' }]);

    await User.findByIdAndUpdate(
      user._id,
      { $inc: { postCount: 1 } },
      { new: true, session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const {
    sort,
    searchTerm,
    page = 1,
    limit = 5,
    category,
    ...searchQuery
  } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Base aggregation pipeline
  const aggregationPipeline: any[] = [
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
    const searchRegex = new RegExp(searchTerm as string, 'i');
    aggregationPipeline.push({
      $match: {
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { 'postAuthor.name': searchRegex },
        ],
      },
    } as any);
  }

  // Add category filter if category is provided
  if (category) {
    aggregationPipeline.push({
      $match: { category: category }, // Adjust this as needed for your filtering logic
    });
  }

  // Add sorting logic
  if (sort === 'upvote' || sort === 'downvote') {
    aggregationPipeline.push({
      $sort: sort === 'upvote' ? { upvoteCount: -1 } : { downvoteCount: 1 },
    } as any);
  } else {
    aggregationPipeline.push({
      $sort: { createdAt: -1 },
    } as any);
  }

  // Add pagination to the pipeline
  aggregationPipeline.push({ $skip: skip }, { $limit: Number(limit) });

  const result = await Post.aggregate(aggregationPipeline);

  if (!result || result.length === 0) {
    return null;
  }

  return { result };
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

    // Check if the user's ObjectId is in the downvote array
    if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { downvote: _id } }, // Use $pull to avoid duplicates
        { new: true, runValidators: true, session },
      );
    }

    const result = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { upvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('upvote');

    await User.findByIdAndUpdate(
      post.postAuthor._id,
      { $inc: { totalUpvote: 1 } },
      { new: true, session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
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

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $pull: { upvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('upvote');

    await User.findByIdAndUpdate(
      post.postAuthor._id,
      { $inc: { totalUpvote: -1 } },
      { new: true, session },
    );

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const addPostDownvoteIntoDB = async (
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
  if (post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User has already downvoted this post!',
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (post.upvote.some((upvoteId) => upvoteId.equals(userId))) {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { upvote: _id } }, // Use $pull to avoid duplicates
        { new: true, runValidators: true, session },
      );
    }

    const result = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { downvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('downvote');

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const removePostDownvoteFromDB = async (
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
  if (!post.downvote.some((downvoteId) => downvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User doesn't exist in downvote collection!",
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $pull: { downvote: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('downvote');

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const getSinglePostFromDB = async (id: string) => {
  const singlePost = await Post.findById(id).populate('postAuthor');

  if (!singlePost) {
    return null;
  } else {
    return singlePost;
  }
};

const getAllPostsInDashboard = async (
  query: Record<string, unknown>,
  userData: Record<string, unknown>,
) => {
  const { email } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const postQuery = new QueryBuilder(Post.find().populate('postAuthor'), query)
    .filter()
    .sort()
    .paginate();

  const meta = await postQuery.countTotal();
  const result = await postQuery.modelQuery;

  if (result.length === 0) {
    return null;
  }

  return { meta, result };
};

const updatePostIntoDB = async (payload: Partial<IPost>, id: string) => {
  const result = await Post.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

const deletePostFromDB = async (
  id: string,
  userData: Record<string, unknown>,
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const postWillBeDeleted = await Post.findById(id);

    const result = await Post.findByIdAndDelete(id);

    if (postWillBeDeleted?.postAuthor?._id !== _id) {
      await User.findByIdAndUpdate(
        postWillBeDeleted?.postAuthor?._id,
        { $inc: { postCount: -1 } },
        { new: true, session },
      );
    } else {
      await User.findByIdAndUpdate(
        _id,
        { $inc: { postCount: -1 } },
        { new: true, session },
      );
    }

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

export const PostServices = {
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
