import { registerAs } from '@nestjs/config';

type AuthConfig = {
  SaltRounds: number;
};

export default registerAs<AuthConfig>('auth', () => ({
  SaltRounds: +process.env.SALT_ROUNDS || 10,
}));
