import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1000000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "loan" (
        "id"           INTEGER  PRIMARY KEY AUTOINCREMENT,
        "name"         VARCHAR  NOT NULL,
        "principal"    REAL     NOT NULL,
        "startDate"    VARCHAR  NOT NULL,
        "endDate"      VARCHAR  NOT NULL,
        "interestRate" REAL     NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "repayment_schedule" (
        "id"               INTEGER  PRIMARY KEY AUTOINCREMENT,
        "loanId"           INTEGER  NOT NULL,
        "paymentDate"      VARCHAR  NOT NULL,
        "paymentType"      VARCHAR  NOT NULL,
        "principal"        REAL     NOT NULL,
        "interest"         REAL     NOT NULL,
        "total"            REAL     NOT NULL,
        "remainingBalance" REAL     NOT NULL,
        CONSTRAINT "FK_repayment_schedule_loan"
          FOREIGN KEY ("loanId") REFERENCES "loan" ("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "repayment_schedule"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "loan"`);
  }
}
