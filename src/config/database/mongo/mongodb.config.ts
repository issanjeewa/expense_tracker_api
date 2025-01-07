import { registerAs } from '@nestjs/config';

type MongodbConfig = {
  dbName: string;
  appName: string;
  connectionString: string;
};

export default registerAs<MongodbConfig>('mongodb', () => ({
  dbName: process.env.MONGO_DB_NAME,
  appName: process.env.MONGO_APP_NAME,
  connectionString: process.env.MONGO_CONNECTION_STRING,
}));
