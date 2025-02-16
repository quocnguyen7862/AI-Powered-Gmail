import {
  DB_HOST,
  DB_NAME,
  DB_PASS,
  DB_PORT,
  DB_SSL,
  DB_USER,
  NODE_ENV,
} from '@environments';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';

export const DatabaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  ssl: DB_SSL,
  synchronize: false,
  logging: NODE_ENV !== 'production',
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
};

export default new DataSource(DatabaseConfig);
