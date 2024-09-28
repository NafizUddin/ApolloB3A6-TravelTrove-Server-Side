import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import handleValidationError from '../errors/handleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import AppError from '../errors/appError';
import { TErrorSources } from '../interface/globalErrorInterface';
import handleZodValidationError from '../errors/handleZodValidationError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';

  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // Zod Error Handling
  if (err instanceof ZodError) {
    const extractedError = handleZodValidationError(err);

    statusCode = extractedError?.statusCode;
    message = extractedError?.message;
    errorSources = extractedError?.errorSources;
  }
  // Mongoose Validation Error Handling
  else if (err?.name === 'ValidationError') {
    const extractedError = handleValidationError(err);

    statusCode = extractedError?.statusCode;
    message = extractedError?.message;
    errorSources = extractedError?.errorSources;
  }
  // non existing id validation
  else if (err?.name === 'CastError') {
    const extractedError = handleCastError(err);

    statusCode = extractedError?.statusCode;
    message = extractedError?.message;
    errorSources = extractedError?.errorSources;
  }
  // duplicate data creation validation
  else if (err?.code === 11000) {
    const extractedError = handleDuplicateError(err);

    statusCode = extractedError?.statusCode;
    message = extractedError?.message;
    errorSources = extractedError?.errorSources;
  }
  // throw new AppError validation
  else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.NODE_ENV === 'development' ? err.stack : null,
  });
};

export default globalErrorHandler;
