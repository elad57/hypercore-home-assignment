import React from 'react';
import styled from 'styled-components';

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
`;

const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.heading};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const Content = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Header>
        <HeaderTitle>Loan Manager</HeaderTitle>
      </Header>
      <Content>{children}</Content>
    </Shell>
  );
}
