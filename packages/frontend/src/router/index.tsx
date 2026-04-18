import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LoansPage } from '../pages/LoansPage';
import { LoanDetailPage } from '../pages/LoanDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/loans" replace />,
  },
  {
    path: '/loans',
    element: (
      <AppShell>
        <LoansPage />
      </AppShell>
    ),
  },
  {
    path: '/loan/:id',
    element: (
      <AppShell>
        <LoanDetailPage />
      </AppShell>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/loans" replace />,
  },
]);
