import httpStatus from 'http-status';
import { QueryBuilder } from '../../builder/QueryBuilder';
import AppError from '../../errors/appError';
import { UserSearchableFields } from './user.constant';
import { User } from './user.model';
import mongoose from 'mongoose';
import { TUser } from './user.interface';
import { initiatePayment } from '../../utils/payment';

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.modelQuery;

  if (result.length === 0) {
    return null;
  }

  return { meta, result };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findById(id);

  return user;
};

const addFollowingIntoDB = async (
  followedId: string,
  userData: Record<string, unknown>,
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const isAlreadyFollowing = await User.findOne({
    _id,
    following: followedId,
  });

  if (isAlreadyFollowing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is already following this profile!',
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await User.findByIdAndUpdate(
      _id,
      { $addToSet: { following: followedId } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('following');

    await User.findByIdAndUpdate(
      followedId,
      { $addToSet: { followers: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('followers');

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const removeFollowingFromDB = async (
  followedId: string,
  userData: Record<string, unknown>,
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const isAlreadyFollowing = await User.findOne({
    _id,
    following: followedId,
  });

  if (!isAlreadyFollowing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User is not following this profile!',
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await User.findByIdAndUpdate(
      _id,
      { $pull: { following: followedId } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('following');

    await User.findByIdAndUpdate(
      followedId,
      { $pull: { followers: _id } }, // Use $addToSet to avoid duplicates
      { new: true, runValidators: true, session },
    ).populate('followers');

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const updateUserIntoDB = async (
  payload: Partial<TUser>,
  id: string,
  userData: Record<string, unknown>,
) => {
  const { email } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

const startPremiumIntoDB = async (
  payload: Partial<TUser>,
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

    await User.findByIdAndUpdate(_id, payload, { new: true });

    const paymentData = {
      transactionId: payload?.transactionId,
      amount: payload?.premiumCharge,
      customerName: user.name,
      customerEmail: user.email,
    };

    const paymentSession = await initiatePayment(paymentData);

    await session.commitTransaction();
    await session.endSession();

    return paymentSession;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

export const UserServices = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  addFollowingIntoDB,
  removeFollowingFromDB,
  updateUserIntoDB,
  startPremiumIntoDB,
};
