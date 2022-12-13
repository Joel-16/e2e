import { Request, Response, NextFunction } from 'express';
import { Encryption } from '../middleware/encryption';
import { createClient } from 'redis';
import { CustomError } from '../utils/CustomError';
import axios from 'axios';

const redisClient = createClient();
redisClient.connect();

export const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let encryption = new Encryption()
    let key =  await redisClient.get("service1")
    let { data } = await axios.post(
      "http://localhost:4000/test",
      await encryption.encryptPayload(
      key , {
          name : "E2e encrpytion",
          test : "test payload"
        }
      ), {
        headers : {
          testKey : key
        }
      }
    )
    console.log(data)
    res.customSuccess(200, await encryption.decryptPayload(key, data));
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};
