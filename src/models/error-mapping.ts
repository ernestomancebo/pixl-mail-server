export interface ErrorMap {
  errorCode: String,
  errorDescription: String;
};

export const ERROR_UNKNOWN = { errorCode: 'MAIL-E40', errorDescription: 'An unknown error occourred' };
export const ERROR_INVALID = { errorCode: 'MAIL-E41', errorDescription: 'Invalid Parameters Provided' };
