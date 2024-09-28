import mongoose from 'mongoose';
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interface/globalErrorInterface';
import httpStatus from 'http-status';

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Validation Error!';

  const errorSources: TErrorSources = Object.values(err.errors).map(
    (value: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: value?.path,
        message: value?.message,
      };
    },
  );

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleValidationError;
