/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Types } from 'mongoose';

export interface IPost {
  title: string;
  category:
    | 'Adventure'
    | 'Business Travel'
    | 'Exploration'
    | 'Family Travel'
    | 'Luxury Travel'
    | 'Budget Travel';
  description: string; // HTML template in string format
  image: string;
  postAuthor: Types.ObjectId;
  upvote: number;
  downvote: number;
}
