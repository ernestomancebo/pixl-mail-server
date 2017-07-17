export interface ErrorMap {
  errorCode: string,
  errorDescription: string;
};

// REQUEST RELATED RESPONSE CODE
export const ERROR_BAD_REQUEST_CODE: number = 400;
// REQUEST RELATED MESSAGES
export const ERROR_UNKNOWN = { errorCode: 'MAIL-E40', errorDescription: 'An unknown error occourred' };
export const ERROR_INVALID = { errorCode: 'MAIL-E41', errorDescription: 'Invalid Parameters Provided' };
export const ERROR_RATE_EXCEEDED = { errorCode: 'MAIL-E42', errorDescription: 'Too many requests.' };

// SERVER RELATED RESPONSE CODE
export const ERROR_INTERNAL_CODE: number = 500;
// SERVER RELATED MESSAGES
export const ERROR_INTERNAL = { errorCode: 'MAIL-E50', errorDescription: 'Something wrong occurred on the server' };
