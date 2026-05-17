import jwt, { type SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  email: string;
}

class AuthTokenService {
  private getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    return secret;
  }

  sign(payload: TokenPayload): string {
    if (!payload.userId) {
      throw new Error('Cannot sign token without user id');
    }
    return jwt.sign(payload, this.getSecret(), {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as SignOptions);
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.getSecret()) as TokenPayload;
  }
}

export default new AuthTokenService();
