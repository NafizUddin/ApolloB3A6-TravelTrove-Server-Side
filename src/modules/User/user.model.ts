/* eslint-disable no-useless-escape */
import bcryptjs from 'bcryptjs';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { USER_ROLE, USER_STATUS } from './user.constant';
import { IUserModel, TUser } from './user.interface';

const userSchema = new Schema<TUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      required: true,
    },
    email: {
      type: String,
      required: true,
      //validate email
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      select: 0, // Exclude password from query results
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.BASIC,
    },
    profilePhoto: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalUpvote: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: 'N/A',
    },
    premiumStart: {
      type: String,
      default: 'N/A',
    },
    premiumEnd: {
      type: String,
      default: 'N/A',
    },
    premiumCharge: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    virtuals: true,
    versionKey: false,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB

  if (user.isModified('password') && user.password) {
    user.password = await bcryptjs.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email })
    .select('+password')
    .populate('followers')
    .populate('following');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcryptjs.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: number,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, IUserModel>('User', userSchema);
