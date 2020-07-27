import * as redisStore from 'cache-manager-redis-store';

interface RedisStoreOptions {
  store: any;
  host: string;
  port: number;
}

export const redisConfig: RedisStoreOptions = {
  store: redisStore,
  host: process.env.REDIS_HOSTNAME,
  port: parseInt(process.env.REDIS_PORT)
};
