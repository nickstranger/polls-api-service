import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.SERVER_PORT;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  logger.log(`App running in ${process.env.MODE}-mode`);
}
bootstrap();
