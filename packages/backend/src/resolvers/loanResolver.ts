import { listLoans, getLoanWithSchedule, createLoan, CreateLoanInput } from '../services/loanService';

export const resolvers = {
  Query: {
    loans: async (_: unknown, args: { page?: number; pageSize?: number }) => {
      const page = Math.max(1, args.page ?? 1);
      const pageSize = Math.min(100, Math.max(1, args.pageSize ?? 5));
      return listLoans(page, pageSize);
    },

    loan: async (_: unknown, args: { id: string }) => {
      const id = Number(args.id);
      if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid loan id');
      return getLoanWithSchedule(id);
    },
  },

  Mutation: {
    createLoan: async (_: unknown, args: { input: CreateLoanInput }) => {
      return createLoan(args.input);
    },
  },
};
