export interface LoanFormValues {
  name: string;
  principal: string;
  startDate: string;
  endDate: string;
}

export type LoanFormErrors = Partial<Record<keyof LoanFormValues, string>>;

export function validateLoanForm(values: LoanFormValues): LoanFormErrors {
  const errors: LoanFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required';
  }

  const principal = parseFloat(values.principal);
  if (!values.principal) {
    errors.principal = 'Principal is required';
  } else if (isNaN(principal) || !isFinite(principal) || principal <= 0) {
    errors.principal = 'Principal must be a positive number';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!values.endDate) {
    errors.endDate = 'End date is required';
  } else if (values.startDate && new Date(values.endDate) <= new Date(values.startDate)) {
    errors.endDate = 'End date must be after start date';
  }

  return errors;
}

export function isFormValid(errors: LoanFormErrors): boolean {
  return Object.keys(errors).length === 0;
}
