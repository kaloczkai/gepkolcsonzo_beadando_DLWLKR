import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../models/transaction.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  createTransaction(transaction: {
    partnerId: number;
    type: 'credit' | 'debit';
    amount: number;
    date: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, transaction);
  }
}
