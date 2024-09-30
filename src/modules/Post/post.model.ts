import { model, Schema } from 'mongoose';
import { IPost } from './post.interface';

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Adventure',
        'Business Travel',
        'Exploration',
        'Family Travel',
        'Luxury Travel',
        'Budget Travel',
      ],
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    postAuthor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvote: { type: Number, default: 0, required: true },
    downvote: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Post = model<IPost>('Post', postSchema);
