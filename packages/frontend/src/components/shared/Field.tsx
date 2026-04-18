import React from 'react';
import styled from 'styled-components';
import { Input } from './Input';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.base};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ErrorText = styled.span`
  font-size: ${({ theme }) => theme.font.small};
  color: ${({ theme }) => theme.colors.error};
  margin-top: 4px;
`;

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export function Field({ label, error, id, ...inputProps }: FieldProps) {
  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} $hasError={!!error} {...inputProps} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
