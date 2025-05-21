import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Machine } from './Machine';
import { Partner } from './Partner';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  startDate!: string;

  @Column({ nullable: true })
  endDate?: string;

  @Column({ default: false })
  returned!: boolean;

  @Column({ default: false })
  intact!: boolean;

  @ManyToOne(() => Partner, (partner) => partner.rentals)
  partner!: Partner;

  @ManyToOne(() => Machine)
  machine!: Machine;
}
