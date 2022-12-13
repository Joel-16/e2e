import {
    BinaryLike,
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scryptSync,
    createDiffieHellman,
    DiffieHellman
  } from "crypto";
  
  export class Encrypter {
    private algorithm: string;
    private key: Buffer;
  
    constructor(encryptionKey: BinaryLike, salt: string) {
      this.algorithm = "aes-192-cbc";
      this.key = scryptSync(encryptionKey, salt, 24);
    }
  
    encrypt(clearText: string): string {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);
      const encrypted = cipher.update(clearText, "utf8", "hex");
      return [
        encrypted + cipher.final("hex"),
        Buffer.from(iv).toString("hex")
      ].join("|");
    }
  
    decrypt(encryptedText: string): string {
      const [encrypted, iv] = encryptedText.split("|");
      if (!iv) throw new Error("IV not found");
      const decipher = createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(iv, "hex")
      );
      return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
    }
  }
  
  export class Keygeneration {
    private initiator!: DiffieHellman;
    private recipient!: DiffieHellman;
  
    initiatorKey(): { key: string; prime: string; generator: string } {
      const first = createDiffieHellman(512);
      this.initiator = first;
      const key = first.generateKeys("base64");
      const prime = first.getPrime("base64");
      const generator = first.getGenerator("base64");
      return {
        key,
        prime,
        generator
      };
    }
  
    recipientKey(prime: string, generator: string): string {
      const second = createDiffieHellman(
        Buffer.from(prime, "base64"),
        Buffer.from(generator, "base64")
      );
      this.recipient = second;
      return second.generateKeys("base64");
    }
  
    initiatorSecret(recipientKey: string): string {
      const secret = this.initiator.computeSecret(
        recipientKey,
        "base64",
        "base64"
      );
      return secret;
    }
  
    recipientSecret(initiatorKey: string): string {
      const secret = this.recipient.computeSecret(
        initiatorKey,
        "base64",
        "base64"
      );
      return secret;
    }
  }
  
