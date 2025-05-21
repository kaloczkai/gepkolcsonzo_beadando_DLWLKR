import { Partner } from './partner.model';

export interface Transaction {
  id?: number;
  type: 'deposit' | 'rental';
  amount: number;
  date: string;
  partner: Partner;
}
