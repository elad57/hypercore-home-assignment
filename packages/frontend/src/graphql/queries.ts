import { gql } from '@apollo/client';

export const LOANS = gql`
  query Loans($page: Int, $pageSize: Int) {
    loans(page: $page, pageSize: $pageSize) {
      items {
        id
        name
        principal
        startDate
        totalExpectedInterest
      }
      total
      page
      pageSize
    }
  }
`;

export const LOAN = gql`
  query Loan($id: ID!) {
    loan(id: $id) {
      id
      name
      principal
      startDate
      endDate
      interestRate
      totalExpectedInterest
      schedule {
        id
        paymentDate
        paymentType
        principal
        interest
        total
        remainingBalance
      }
    }
  }
`;
