import axios from "axios";
import { Encrypter, Keygeneration } from "../utils/encrypter";
import { createClient } from "redis";
import { randomBytes } from "crypto";


export class Encryption {
  private keygeneration: Keygeneration;
  private redisClient : ReturnType<typeof createClient>;

  constructor() {
    this.keygeneration = new Keygeneration();
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  async getInitiatorSecret(url?: string) {
    const keyDetails = this.keygeneration.initiatorKey();
    const { key } = keyDetails;
    let { data }= await axios.post(url, keyDetails);
    const secretKey = this.keygeneration.initiatorSecret(data.public_key);
    await this.redisClient.set(data.public_key, secretKey);
    return { publicKey: key };
  }

  async recipientKeys(
    prime: string,
    generator: string,
    key: string
  ): Promise<{ public_key: string; secretKey: string }> {
    const public_key = this.keygeneration.recipientKey(prime, generator);
    const secretKey = this.keygeneration.recipientSecret(key);
    await this.redisClient.set(key, secretKey);
    return { public_key, secretKey };
  }

  async decryptPayload(
    cuepriseHeader: string,
    data: { payload: string; salt: string }
  ) {
    const secretKey = await this.redisClient.get(cuepriseHeader);
    if (!secretKey) {
      throw new Error("Invalid header value");
    }
    const encryption = new Encrypter(secretKey, data.salt);
    return JSON.parse(encryption.decrypt(data.payload));
  }

  async encryptPayload(cuepriseHeader: string, payload: object) {
    const salt = randomBytes(16).toString("base64");
    const secretKey = await this.redisClient.get(cuepriseHeader);
    if (!secretKey) {
      throw new Error("Invalid header value");
    }
    const encryption = new Encrypter(secretKey, salt);
    return { payload: encryption.encrypt(JSON.stringify(payload)), salt };
  }
}
