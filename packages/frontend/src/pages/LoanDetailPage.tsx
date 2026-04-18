import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { LOAN } from '../graphql/queries';
import { LoanQueryResult, LoanQueryVars } from '../types/graphql';
import { ScheduleTable } from '../components/schedule/ScheduleTable';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Button } from '../components/shared/Button';
import { formatCurrency, formatDate, formatPercent } from '../utils/format';

const BackRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const LoanHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const LoanName = styled.h2`
  font-size: ${({ theme }) => theme.font.heading};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
`;

const MetaItem = styled.div``;

const MetaLabel = styled.div`
  font-size: ${({ theme }) => theme.font.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 2px;
`;

const MetaValue = styled.div`
  font-size: ${({ theme }) => theme.font.base};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.base};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const NotFound = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<LoanQueryResult, LoanQueryVars>(LOAN, {
    variables: { id: id! },
    skip: !id,
  });

  if (loading) return (
    <>
      <BackRow>
        <Button $variant="ghost" onClick={() => navigate('/loans')}>← Back</Button>
      </BackRow>
      <LoadingSpinner />
    </>
  );

  if (error) return (
    <>
      <BackRow>
        <Button $variant="ghost" onClick={() => navigate('/loans')}>← Back</Button>
      </BackRow>
      <ErrorMessage message={`Failed to load loan: ${error.message}`} />
    </>
  );

  if (!data?.loan) return (
    <>
      <BackRow>
        <Button $variant="ghost" onClick={() => navigate('/loans')}>← Back</Button>
      </BackRow>
      <NotFound>Loan not found.</NotFound>
    </>
  );

  const loan = data.loan;
  const schedule = loan.schedule ?? [];

  return (
    <>
      <BackRow>
        <Button $variant="ghost" onClick={() => navigate('/loans')}>← Back</Button>
      </BackRow>

      <LoanHeader>
        <LoanName>{loan.name}</LoanName>
        <MetaGrid>
          <MetaItem>
            <MetaLabel>Principal</MetaLabel>
            <MetaValue>{formatCurrency(loan.principal)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Interest Rate</MetaLabel>
            <MetaValue>{formatPercent(loan.interestRate)} / yr</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Start Date</MetaLabel>
            <MetaValue>{formatDate(loan.startDate)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>End Date</MetaLabel>
            <MetaValue>{formatDate(loan.endDate)}</MetaValue>
          </MetaItem>
          <MetaItem>
            <MetaLabel>Total Expected Interest</MetaLabel>
            <MetaValue>{formatCurrency(loan.totalExpectedInterest)}</MetaValue>
          </MetaItem>
        </MetaGrid>
      </LoanHeader>

      <SectionTitle>Repayment Schedule</SectionTitle>
      <ScheduleTable rows={schedule} />
    </>
  );
}
