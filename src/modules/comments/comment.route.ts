import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { commentValidations } from './comment.validation';
import { CommentControllers } from './comment.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER),
  validateRequest(commentValidations.createCommentValidationSchema),
  CommentControllers.createComment,
);

// router.get('/:id', carServiceControllers.getSingleService);

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

router.get('/', CommentControllers.getPostAllComments);

export const CommentRoutes = router;
