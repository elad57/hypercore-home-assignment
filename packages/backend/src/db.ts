import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Loan } from './entities/Loan';
import { RepaymentSchedule } from './entities/RepaymentSchedule';
import { InitSchema1000000000000 } from './migrations/1000000000000-InitSchema';
import { DebugLogger } from './utils/debugLogger';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH as string,
  // synchronize is intentionally false — schema changes must go through migrations.
  synchronize: false,
  logging: ['query', 'error'],
  logger: new DebugLogger(),
  entities: [Loan, RepaymentSchedule],
  migrations: [InitSchema1000000000000],
});
