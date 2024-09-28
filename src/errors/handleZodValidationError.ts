import { ZodError, ZodIssue } from 'zod';
import httpStatus from 'http-status';
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interface/globalErrorInterface';

const handleZodValidationError = (err: ZodError): TGenericErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Zod Validation Error';
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleZodValidationError;
