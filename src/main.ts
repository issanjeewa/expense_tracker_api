import {
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { textSync as figlet } from 'figlet';
import helmet from 'helmet';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { AppConfigService } from './config';

async function bootstrap() {
  console.log(figlet('EXPENSE TRACKER API'));
  console.log(
    '-----------------------------------------------------------------------',
  );

  const httpLogger = new Logger('Http');
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
    cors: true,
  });

  app.use(helmet());

  app.use(compression());

  app.use(
    morgan('tiny', {
      stream: {
        write(str) {
          httpLogger.log(str.replace('\n', ''));
        },
      },
    }),
  );

  app.setGlobalPrefix('/api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('Expense Tracker API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/swagger', app, document);

  const appConfig = app.get(AppConfigService);

  await app.listen(appConfig.port);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
