import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from './database.config';
import Redis from 'ioredis';
import {
  MONGODB_DB,
  MONGODB_PASS,
  MONGODB_URL,
  MONGODB_USER,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
  REDIS_USER,
} from '@environments';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(DatabaseConfig),
    MongooseModule.forRoot(MONGODB_URL, {
      dbName: MONGODB_DB,
      user: MONGODB_USER,
      pass: MONGODB_PASS,
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: REDIS_HOST,
          port: parseInt(REDIS_PORT),
          username: REDIS_USER,
          password: REDIS_PASS,
        });
      },
    },
    // {
    //   provide: 'MONGODB_CLIENT',
    //   useFactory: () => {
    //     mongoose.connect(MONGODB_URL);
    //   },
    // },
  ],
  exports: ['REDIS_CLIENT'],
})
export class DatabaseModule {}
