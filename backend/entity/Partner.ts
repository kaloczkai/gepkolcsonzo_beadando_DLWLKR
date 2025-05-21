import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';
import { Rental } from './Rental';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  representative!: string;

  @Column()
  taxNumber!: string;

  @Column()
  companyNumber!: string;

  @Column()
  headquarters!: string;

  @Column({ type: 'integer', default: 15000 }) // regisztrációkor
  balance!: number;

  @OneToMany(() => Transaction, (transaction) => transaction.partner)
  transactions!: Transaction[];

  @OneToMany(() => Rental, rental => rental.partner)
  rentals!: Rental[];

}
