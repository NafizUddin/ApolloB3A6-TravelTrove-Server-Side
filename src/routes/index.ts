import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { PostRoutes } from '../modules/Post/post.route';
import { CommentRoutes } from '../modules/comments/comment.route';
import { PaymentRoutes } from '../modules/Payments/payment.route';

const router = Router();

const moduleRouter = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

moduleRouter.forEach((route) => router.use(route.path, route.route));

export default router;
