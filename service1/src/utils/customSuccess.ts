import { response, Response } from 'express';

response.customSuccess = function (httpStatusCode: number, data: any = null): Response {
  return this.status(httpStatusCode).json(data );
};
