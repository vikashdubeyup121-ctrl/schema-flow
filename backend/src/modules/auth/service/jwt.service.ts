import jwt from 'jsonwebtoken';
import { config } from '../../../config/app';

import { SignOptions } from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtService {
  sign(payload: JwtPayload, expiresIn?: string | number): string {
    const options: SignOptions = { expiresIn: (expiresIn ?? Math.floor(config.jwtExpiration / 1000)) as any };
    return jwt.sign(payload as any, config.jwtSecret, options);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  }
  
  decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
