export {}
declare global {
  namespace Express {
    export interface Response {
      customSuccess(httpStatusCode: number, message: string, data?: any): Response;
    }
  }
}
