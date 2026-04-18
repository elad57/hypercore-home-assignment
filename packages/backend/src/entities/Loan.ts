import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RepaymentSchedule } from './RepaymentSchedule';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('real')
  principal!: number;

  @Column()
  startDate!: string; // "YYYY-MM-DD"

  @Column()
  endDate!: string; // "YYYY-MM-DD"

  @Column('real')
  interestRate!: number; // annual rate as decimal at time of creation (e.g. 0.085)

  @OneToMany(() => RepaymentSchedule, (s) => s.loan, { cascade: true })
  schedule!: RepaymentSchedule[];
}
