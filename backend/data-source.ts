import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Machine } from './entity/Machine';
import { Partner } from './entity/Partner';
import { Transaction } from './entity/Transaction';
import { Rental } from './entity/Rental';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'gepek.db',
  synchronize: true,
  logging: false,
  entities: [Machine, Partner, Transaction, Rental],
});
