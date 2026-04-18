import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from './Loan';

export type PaymentType = 'INTEREST' | 'MATURITY';

@Entity()
export class RepaymentSchedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Loan, (loan) => loan.schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: Loan;

  @Column()
  loanId!: number;

  @Column()
  paymentDate!: string; // "YYYY-MM-DD"

  @Column()
  paymentType!: PaymentType;

  @Column('real')
  principal!: number;

  @Column('real')
  interest!: number;

  @Column('real')
  total!: number;

  @Column('real')
  remainingBalance!: number;
}
