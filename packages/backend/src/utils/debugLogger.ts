import { Logger, QueryRunner } from 'typeorm';

export class DebugLogger implements Logger {
  logQuery(query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    console.debug('[SQL] query:', query);
    if (parameters?.length) console.debug('[SQL] parameters:', parameters);
  }

  logQueryError(error: string | Error, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    console.debug('[SQL] query failed:', query);
    if (parameters?.length) console.debug('[SQL] parameters:', parameters);
    console.debug('[SQL] error:', error);
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[], _queryRunner?: QueryRunner) {
    console.debug(`[SQL] slow query (${time}ms):`, query);
    if (parameters?.length) console.debug('[SQL] parameters:', parameters);
  }

  logSchemaBuild(message: string) { console.debug('[SQL] schema:', message); }
  logMigration(message: string) { console.debug('[SQL] migration:', message); }
  log(_level: 'log' | 'info' | 'warn', message: unknown) { console.debug('[SQL]', message); }
}
