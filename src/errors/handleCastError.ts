import mongoose from 'mongoose';
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interface/globalErrorInterface';
import httpStatus from 'http-status';

const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Invalid input id';

  const errorSources: TErrorSources = [
    {
      path: err?.path,
      message: err?.message,
    },
  ];

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleCastError;
