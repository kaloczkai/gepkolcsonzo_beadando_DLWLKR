import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Machine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @Column()
  brand!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column('int')
  powerWatt!: number;

  @Column('int')
  weightKg!: number;

  @Column('int')
  deposit!: number;

  @Column('int')
  dailyRate!: number;
}
