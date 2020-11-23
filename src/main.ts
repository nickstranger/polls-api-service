import { NestFactory } from '@nestjs/core';
import { Logger, LogLevel } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const loggerLevels: LogLevel[] =
    process.env.NODE_ENV === 'prod'
      ? ['error', 'warn']
      : ['error', 'warn', 'log', 'verbose', 'debug'];
  const port = process.env.SERVER_PORT;

  const app = await NestFactory.create(AppModule, { logger: loggerLevels });
  await app.listen(port);
  logger.log(
    `App running in ${process.env.NODE_ENV}-mode on ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  );
}
bootstrap();
