import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';
import { CREATE_LOAN } from '../../graphql/mutations';
import { LOANS } from '../../graphql/queries';
import { Field } from '../shared/Field';
import { Button } from '../shared/Button';
import { ErrorMessage } from '../shared/ErrorMessage';
import { validateLoanForm, isFormValid, LoanFormValues } from '../../utils/validation';
import { CreateLoanMutationVars, CreateLoanMutationResult } from '../../types/graphql';

const PAGE_SIZE = parseInt(process.env.REACT_APP_PAGE_SIZE || '5', 10);

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ServerErrorWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

interface NewLoanFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const EMPTY_FORM: LoanFormValues = {
  name: '',
  principal: '',
  startDate: '',
  endDate: '',
};

export function NewLoanForm({ onSuccess, onCancel }: NewLoanFormProps) {
  const [values, setValues] = useState<LoanFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<LoanFormValues>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [createLoan, { loading }] = useMutation<CreateLoanMutationResult, CreateLoanMutationVars>(CREATE_LOAN, {
    refetchQueries: [{ query: LOANS, variables: { page: 1, pageSize: PAGE_SIZE } }],
    awaitRefetchQueries: true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateLoanForm(values);
    if (!isFormValid(validationErrors)) {
      setErrors(validationErrors as Partial<LoanFormValues>);
      return;
    }

    try {
      await createLoan({
        variables: {
          input: {
            name: values.name.trim(),
            principal: parseFloat(values.principal),
            startDate: values.startDate,
            endDate: values.endDate,
          },
        },
      });
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to create loan. Please try again.');
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      {serverError && (
        <ServerErrorWrapper>
          <ErrorMessage message={serverError} />
        </ServerErrorWrapper>
      )}
      <Field
        id="name"
        name="name"
        label="Loan Name"
        type="text"
        placeholder="e.g. Home Mortgage"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        autoFocus
      />
      <Field
        id="principal"
        name="principal"
        label="Principal Amount ($)"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="e.g. 100000"
        value={values.principal}
        onChange={handleChange}
        error={errors.principal}
      />
      <Field
        id="startDate"
        name="startDate"
        label="Start Date"
        type="date"
        value={values.startDate}
        onChange={handleChange}
        error={errors.startDate}
      />
      <Field
        id="endDate"
        name="endDate"
        label="End Date"
        type="date"
        value={values.endDate}
        onChange={handleChange}
        error={errors.endDate}
      />
      <Actions>
        <Button type="button" $variant="ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Loan'}
        </Button>
      </Actions>
    </Form>
  );
}
