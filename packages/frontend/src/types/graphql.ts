export interface ScheduleRow {
  id: string;
  paymentDate: string;
  paymentType: 'INTEREST' | 'MATURITY';
  principal: number;
  interest: number;
  total: number;
  remainingBalance: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  totalExpectedInterest: number;
  schedule?: ScheduleRow[];
}

export interface LoanPage {
  items: Loan[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateLoanInput {
  name: string;
  principal: number;
  startDate: string;
  endDate: string;
}

// Query shapes
export interface LoansQueryVars {
  page?: number;
  pageSize?: number;
}

export interface LoansQueryResult {
  loans: LoanPage;
}

export interface LoanQueryVars {
  id: string;
}

export interface LoanQueryResult {
  loan: Loan | null;
}

// Mutation shapes
export interface CreateLoanMutationVars {
  input: CreateLoanInput;
}

export interface CreateLoanMutationResult {
  createLoan: { id: string };
}
