import React, { useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { LOANS } from '../graphql/queries';
import { LoansQueryResult, LoansQueryVars } from '../types/graphql';
import { LoanTable } from '../components/loans/LoanTable';
import { NewLoanModal } from '../components/loans/NewLoanModal';
import { Pagination } from '../components/shared/Pagination';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Button } from '../components/shared/Button';

const PAGE_SIZE = parseInt(process.env.REACT_APP_PAGE_SIZE || '5', 10);

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const PageTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.heading};
  color: ${({ theme }) => theme.colors.text};
`;

export function LoansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const { data, loading, error } = useQuery<LoansQueryResult, LoansQueryVars>(LOANS, {
    variables: { page, pageSize: PAGE_SIZE },
  });

  function handlePageChange(newPage: number) {
    setSearchParams({ page: String(newPage) });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.loans.total / PAGE_SIZE)) : 1;
  const clampedPage = Math.min(page, totalPages);

  return (
    <>
      <PageHeader>
        <PageTitle>Loans</PageTitle>
        <Button $variant="primary" onClick={() => setModalOpen(true)}>
          + New Loan
        </Button>
      </PageHeader>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={`Failed to load loans: ${error.message}`} />}
      {data && (
        <>
          <LoanTable loans={data.loans.items} />
          <Pagination page={clampedPage} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}

      <NewLoanModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
