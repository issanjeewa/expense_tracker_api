import { registerAs } from '@nestjs/config';

type AuthConfig = {
  SaltRounds: number;
  JWT_SECRET: string;
  JWT_TOKEN_EXPIRY: string;
  JWT_IGNORE_TOKEN_EXPIRY: boolean;
};

export default registerAs<AuthConfig>('auth', () => ({
  SaltRounds: +process.env.SALT_ROUNDS || 10,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_TOKEN_EXPIRY: process.env.JWT_TOKEN_EXPIRY || '30m',
  JWT_IGNORE_TOKEN_EXPIRY: process.env.JWT_IGNORE_TOKEN_EXPIRY === 'true',
}));
