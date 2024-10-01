import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentServices } from './comment.services';

const createComment = catchAsync(async (req, res) => {
  const result = await CommentServices.createCommentIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post created successfully',
    data: result,
  });
});

const getPostAllComments = catchAsync(async (req, res) => {
  const result = await CommentServices.getPostAllCommentsFromDB(req.query);

  if (result === null) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No Data Found',
      data: [],
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post comments retrieved successfully',
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getPostAllComments,
  //   getSinglePost,
  //   updatePost,
  //   deletePost,
};
