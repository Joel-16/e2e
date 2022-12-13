import { Request, Response, NextFunction } from 'express';
import { Encryption } from '../middleware/encryption';
import { createClient } from 'redis';
import { CustomError } from '../utils/CustomError';

const redisClient = createClient();
redisClient.connect();

export const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let testKey = req.header("testKey");
    let encryption = new Encryption();
    let payload = await encryption.decryptPayload(testKey, req.body)
    res.customSuccess(200, await encryption.encryptPayload(testKey, payload));
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
