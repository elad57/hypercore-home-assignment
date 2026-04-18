import { In } from 'typeorm';
import { AppDataSource } from '../db';
import { Loan } from '../entities/Loan';
import { RepaymentSchedule } from '../entities/RepaymentSchedule';
import { getRateHistory, getCurrentRate } from './rateService';
import { generateSchedule } from './scheduleService';

export interface CreateLoanInput {
  name: string;
  principal: number;
  startDate: string;
  endDate: string;
}

export interface LoanWithInterest extends Loan {
  totalExpectedInterest: number;
}

export async function listLoans(
  page: number,
  pageSize: number
): Promise<{ items: LoanWithInterest[]; total: number; page: number; pageSize: number }> {
  const loanRepo = AppDataSource.getRepository(Loan);

  let loans: Loan[];
  let total: number;
  try {
    const skip = (page - 1) * pageSize;
    console.debug('[listLoans] query params:', { page, pageSize, skip, take: pageSize });

    // Query 1: paginate on the loan table only — no JOIN, so LIMIT applies to distinct loans.
    // Using a joined findAndCount with take/skip causes TypeORM to apply LIMIT to the joined
    // rows, returning fewer loans than expected when each loan has many schedule rows.
    const [idRows, count] = await loanRepo.findAndCount({
      select: { id: true },
      order: { id: 'DESC' },
      skip,
      take: pageSize,
    });
    total = count;
    const ids = idRows.map(r => r.id);

    if (ids.length === 0) {
      console.debug('[listLoans] result: no loans on this page');
      return { items: [], total, page, pageSize };
    }

    // Query 2: hydrate the paginated loans with their schedule relations.
    loans = await loanRepo.find({
      where: { id: In(ids) },
      relations: ['schedule'],
      // `as any` works around a TypeORM typing gap — nested relation ordering is
      // supported at runtime but not reflected in the FindManyOptions type definitions.
      order: { id: 'DESC', schedule: { paymentDate: 'ASC' } } as any,
    });
    console.debug('[listLoans] result:', { total, returned: loans.length, ids: loans.map(l => l.id) });
  } catch (err) {
    console.error('Error fetching loans:', err);
    throw new Error('Failed to fetch loans');
  }

  const items: LoanWithInterest[] = loans.map((loan) => ({
    ...loan,
    totalExpectedInterest: Math.round(loan.schedule.reduce((sum, row) => sum + row.interest, 0) * 100) / 100,
  }));

  return { items, total, page, pageSize };
}

export async function getLoanWithSchedule(id: number): Promise<LoanWithInterest | null> {
  const loanRepo = AppDataSource.getRepository(Loan);

  let loan: Loan | null = null;
  try {
    loan = await loanRepo.findOne({
      where: { id },
      relations: ['schedule'],
      // `as any` — same TypeORM nested ordering typing gap as in listLoans.
      order: { schedule: { paymentDate: 'ASC' } } as any,
    });
  } catch (err) {
    console.error(`Error fetching loan with id ${id}:`, err);
    throw new Error(`Failed to fetch loan ${id}`);
  }

  if (!loan) return null;

  const totalExpectedInterest = Math.round(loan.schedule.reduce((sum, row) => sum + row.interest, 0) * 100) / 100;

  return { ...loan, totalExpectedInterest };
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateCreateLoanInput(input: CreateLoanInput): void {
  if (!input.name.trim()) throw new Error('Loan name is required');
  if (!Number.isFinite(input.principal) || input.principal <= 0)
    throw new Error('Principal must be a positive number');
  if (!ISO_DATE_RE.test(input.startDate) || isNaN(Date.parse(input.startDate)))
    throw new Error('startDate must be a valid date in YYYY-MM-DD format');
  if (!ISO_DATE_RE.test(input.endDate) || isNaN(Date.parse(input.endDate)))
    throw new Error('endDate must be a valid date in YYYY-MM-DD format');
  if (input.endDate <= input.startDate)
    throw new Error('endDate must be after startDate');
}

export async function createLoan(input: CreateLoanInput): Promise<LoanWithInterest> {
  validateCreateLoanInput(input);

  const rateHistory = getRateHistory();
  const currentRate = getCurrentRate(rateHistory);

  const scheduleRows = generateSchedule(
    input.principal,
    input.startDate,
    input.endDate,
    rateHistory
  );

  return AppDataSource.transaction(async (manager) => {
    const loan = manager.create(Loan, {
      name: input.name,
      principal: input.principal,
      startDate: input.startDate,
      endDate: input.endDate,
      interestRate: currentRate,
    });

    const savedLoan = await manager.save(loan);

    const scheduleEntities = scheduleRows.map((row) =>
      manager.create(RepaymentSchedule, {
        loanId: savedLoan.id,
        paymentDate: row.paymentDate,
        paymentType: row.paymentType,
        principal: row.principal,
        interest: row.interest,
        total: row.total,
        remainingBalance: row.remainingBalance,
      })
    );

    const savedSchedule = await manager.save(scheduleEntities);
    const totalExpectedInterest = Math.round(savedSchedule.reduce((sum, row) => sum + row.interest, 0) * 100) / 100;

    return { ...savedLoan, schedule: savedSchedule, totalExpectedInterest };
  });
}
