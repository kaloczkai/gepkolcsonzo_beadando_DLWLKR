import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Partner } from './Partner';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: 'deposit' | 'rental';

  @Column('integer')
  amount!: number;

  @Column()
  date!: string;

  @ManyToOne(() => Partner, (partner) => partner.transactions)
  partner!: Partner;
}
