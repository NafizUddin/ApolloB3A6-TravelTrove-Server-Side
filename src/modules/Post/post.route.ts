import express from 'express';
import { PostValidations } from './post.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PostControllers } from './post.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER),
  validateRequest(PostValidations.createPostValidationSchema),
  PostControllers.createPost,
);

router.post(
  '/:postId/upvote',
  auth(USER_ROLE.USER),
  PostControllers.addPostUpvote,
);

router.post(
  '/:postId/downvote',
  auth(USER_ROLE.USER),
  PostControllers.addPostDownvote,
);

router.delete(
  '/:postId/upvote',
  auth(USER_ROLE.USER),
  PostControllers.removePostUpvote,
);

router.delete(
  '/:postId/downvote',
  auth(USER_ROLE.USER),
  PostControllers.removePostDownvote,
);

router.get('/:id', PostControllers.getSinglePost);

// router.put(
//   '/:id',
//   auth(USER_ROLE.admin),
//   validateRequest(carServiceValidations.updateCarServiceValidationSchema),
//   carServiceControllers.updateService,
// );

// router.delete(
//   '/:id',
//   auth(USER_ROLE.admin),
//   carServiceControllers.deleteService,
// );

router.get('/', PostControllers.getAllPosts);

export const PostRoutes = router;
