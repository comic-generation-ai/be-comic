import { DataSource } from 'typeorm';
import { dbConfig } from '../common/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
  logging: true,
});
