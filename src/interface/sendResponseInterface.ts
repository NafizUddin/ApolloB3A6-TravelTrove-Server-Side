/* eslint-disable @typescript-eslint/no-explicit-any */
export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: TMeta;
  data: T;
  paymentSession?: any;
};
