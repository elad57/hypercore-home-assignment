import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.font.base};
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Wrapper>
      <Button $variant="secondary" $size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Prev
      </Button>
      <PageInfo>
        Page {page} of {totalPages}
      </PageInfo>
      <Button $variant="secondary" $size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next →
      </Button>
    </Wrapper>
  );
}
