export const typeDefs = `#graphql
  type Loan {
    id: ID!
    name: String!
    principal: Float!
    startDate: String!
    endDate: String!
    interestRate: Float!
    totalExpectedInterest: Float!
    schedule: [ScheduleRow!]
  }

  type ScheduleRow {
    id: ID!
    paymentDate: String!
    paymentType: String!
    principal: Float!
    interest: Float!
    total: Float!
    remainingBalance: Float!
  }

  type LoanPage {
    items: [Loan!]!
    total: Int!
    page: Int!
    pageSize: Int!
  }

  type Query {
    loans(page: Int, pageSize: Int): LoanPage!
    loan(id: ID!): Loan
  }

  type Mutation {
    createLoan(input: CreateLoanInput!): Loan!
  }

  input CreateLoanInput {
    name: String!
    principal: Float!
    startDate: String!
    endDate: String!
  }
`;
