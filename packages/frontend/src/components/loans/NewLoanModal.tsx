import React from 'react';
import { Modal } from '../shared/Modal';
import { NewLoanForm } from './NewLoanForm';

interface NewLoanModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewLoanModal({ open, onClose }: NewLoanModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="New Loan">
      <NewLoanForm onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}
