import { Response } from 'express';
import { TResponse } from '../interface/sendResponseInterface';

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  return res.status(data?.statusCode).json({
    success: data?.success,
    statusCode: data?.statusCode,
    message: data?.message,
    meta: data?.meta,
    data: data?.data,
    paymentSession: data?.paymentSession,
  });
};

export default sendResponse;
