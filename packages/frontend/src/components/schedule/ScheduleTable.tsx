import React from 'react';
import styled from 'styled-components';
import { ScheduleRow } from '../../types/graphql';
import { formatCurrency, formatDate, formatPaymentType } from '../../utils/format';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.base};
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

const Tr = styled.tr<{ $isMaturity?: boolean }>`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  background: ${({ $isMaturity, theme }) => ($isMaturity ? theme.colors.maturityBg : 'transparent')};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-variant-numeric: tabular-nums;

  &:first-child {
    text-align: left;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MaturityBadge = styled.span`
  display: inline-block;
  font-size: ${({ theme }) => theme.font.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary}18;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 6px;
`;

interface ScheduleTableProps {
  rows: ScheduleRow[];
}

export function ScheduleTable({ rows }: ScheduleTableProps) {
  if (rows.length === 0) {
    return <EmptyState>No repayment schedule available.</EmptyState>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Payment Date</Th>
          <Th>Type</Th>
          <Th>Principal</Th>
          <Th>Interest</Th>
          <Th>Total</Th>
          <Th>Remaining Balance</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isMaturity = row.paymentType === 'MATURITY';
          return (
            <Tr key={row.id} $isMaturity={isMaturity}>
              <Td>{formatDate(row.paymentDate)}</Td>
              <Td>
                {isMaturity ? (
                  <MaturityBadge>{formatPaymentType(row.paymentType)}</MaturityBadge>
                ) : (
                  formatPaymentType(row.paymentType)
                )}
              </Td>
              <Td>{formatCurrency(row.principal)}</Td>
              <Td>{formatCurrency(row.interest)}</Td>
              <Td>{formatCurrency(row.total)}</Td>
              <Td>{formatCurrency(row.remainingBalance)}</Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
