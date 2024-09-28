import httpStatus from 'http-status';
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interface/globalErrorInterface';

const handleDuplicateError = (err: {
  message: string;
}): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);

  // The extracted value will be in the first capturing group
  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = httpStatus.BAD_REQUEST;
  const message = 'Invalid ID';

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleDuplicateError;
