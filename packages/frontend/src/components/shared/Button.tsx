import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'ghost';

export const Button = styled.button<{ $variant?: Variant; $size?: 'sm' | 'md' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.font.base};
  font-weight: 500;
  padding: ${({ theme, $size }) =>
    $size === 'sm' ? `${theme.spacing(1)} ${theme.spacing(2)}` : `${theme.spacing(1)} ${theme.spacing(2)}`};
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant = 'primary', theme }) => {
    if ($variant === 'primary') {
      return css`
        background: ${theme.colors.primary};
        color: #fff;
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
        }
      `;
    }
    if ($variant === 'secondary') {
      return css`
        background: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}10;
        }
      `;
    }
    if ($variant === 'ghost') {
      return css`
        background: transparent;
        color: ${theme.colors.textMuted};
        &:hover:not(:disabled) {
          color: ${theme.colors.text};
          background: ${theme.colors.border};
        }
      `;
    }
  }}
`;
