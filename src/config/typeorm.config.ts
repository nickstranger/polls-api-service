import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { NamingStrategy } from './typeormNamingStrategy.config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOSTNAME,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.migration.{js,ts}'],
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: ['error', 'warn'],
  retryAttempts: 5,
  maxQueryExecutionTime: 2000,
  cache: true,
  namingStrategy: new NamingStrategy()
};
