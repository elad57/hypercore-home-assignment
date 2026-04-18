import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Loan } from '../../types/graphql';
import { formatCurrency, formatDate } from '../../utils/format';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Th = styled.th`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.font.small};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    text-align: left;
  }
`;

const Tr = styled.tr`
  cursor: pointer;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.base};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;

  &:first-child {
    text-align: left;
  }
`;

const TdRight = styled(Td)`
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

interface LoanTableProps {
  loans: Loan[];
}

export function LoanTable({ loans }: LoanTableProps) {
  const navigate = useNavigate();

  if (loans.length === 0) {
    return <EmptyState>No loans yet — click "New Loan" to create one.</EmptyState>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Principal</Th>
          <Th>Start Date</Th>
          <Th>Total Expected Interest</Th>
        </tr>
      </thead>
      <tbody>
        {loans.map((loan) => (
          <Tr key={loan.id} onClick={() => navigate(`/loan/${loan.id}`)}>
            <Td>{loan.name}</Td>
            <TdRight>{formatCurrency(loan.principal)}</TdRight>
            <Td>{formatDate(loan.startDate)}</Td>
            <TdRight>{formatCurrency(loan.totalExpectedInterest)}</TdRight>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
