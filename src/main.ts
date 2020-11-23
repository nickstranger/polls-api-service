import { NestFactory } from '@nestjs/core';
import { Logger, LogLevel } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const loggerLevels: LogLevel[] =
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['error', 'warn', 'log', 'verbose', 'debug'];
  const port = process.env.SERVER_PORT;

  const app = await NestFactory.create(AppModule, { logger: loggerLevels });
  await app.listen(port);
  logger.log(`App running in ${process.env.RUNNING_MODE}-mode`);
}
bootstrap();
