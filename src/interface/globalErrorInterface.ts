export type TErrorSources = {
  path: string | number;
  message: string;
}[];

// type for return value of handle error functions
export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};
