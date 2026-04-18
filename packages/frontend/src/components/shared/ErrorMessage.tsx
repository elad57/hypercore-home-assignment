import React from 'react';
import styled from 'styled-components';

const Box = styled.div`
  background: ${({ theme }) => theme.colors.errorBg};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.base};
`;

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <Box role="alert">{message}</Box>;
}
