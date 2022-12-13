import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis'; 
import { CustomError } from '../utils/CustomError';
import {Encryption } from "../middleware/encryption"

const redisClient = createClient()
redisClient.connect()

export const getKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let encryption = new Encryption()
    let data = await encryption.getInitiatorSecret("http://localhost:3000/keys")
    await redisClient.set("service1", data.publicKey)
    res.customSuccess(200, {message : "ok"});
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Error', null, err);
    return next(customError);
  }
};

export const processKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const { key, prime, generator } = req.body
      let encryption = new Encryption()
      let data = await encryption.recipientKeys(prime, generator, key )
      await redisClient.set("service2", data.public_key);
      res.customSuccess(200, {public_key : data.public_key});
    } catch (err) {
      const customError = new CustomError(400, 'Raw', 'Error', null, err);
      return next(customError);
    }
  };
