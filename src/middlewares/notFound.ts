import { Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (req: Request, res: Response) => {
  return res.json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: 'Not found!',
  });
};

export default notFound;
