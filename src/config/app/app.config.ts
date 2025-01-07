import { registerAs } from '@nestjs/config';

export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
}

type AppConfig = {
  port: number;
  name: string;
  nodeEnv: Environment;
};

export default registerAs<AppConfig>('app', () => ({
  port: +process.env.APP_PORT || 3000,
  name: process.env.APP_NAME || 'expense-tracker-api',
  nodeEnv: (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT,
}));
