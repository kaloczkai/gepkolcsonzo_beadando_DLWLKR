import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-partner-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './partner-details.component.html',
})
export class PartnerDetailsComponent implements OnInit {
  partnerId!: number;
  partner: any = null;
  editablePartner: any = {
    name: '',
    contact: '',
    taxNumber: '',
    companyNumber: '',
    address: ''
  };

  transactions: any[] = [];
  fromDate: string = '';
  toDate: string = '';
  topupAmount: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.partnerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPartner();
    this.loadTransactions();
  }

  loadPartner(): void {
    this.http.get(`http://localhost:3000/partners/${this.partnerId}`).subscribe((data: any) => {
      this.partner = data;
      this.editablePartner = {
        name: data.name || '',
        contact: data.contact || '',
        taxNumber: data.taxNumber || '',
        companyNumber: data.companyNumber || '',
        address: data.address || ''
      };
    });
  }

  savePartner(): void {
    this.http.put(`http://localhost:3000/partners/${this.partnerId}`, this.editablePartner).subscribe({
      next: () => {
        alert('Partner adatai elmentve');
        this.loadPartner(); // újratöltés mentés után
      },
      error: err => {
        console.error('Mentési hiba:', err);
        alert('Hiba történt mentés közben');
      }
    });
  }

  submitTopup(): void {
    if (this.topupAmount <= 0) {
      alert('Adj meg pozitív összeget!');
      return;
    }

    const transaction = {
      partnerId: this.partnerId,
      type: 'deposit',
      amount: this.topupAmount,
      date: new Date().toISOString().split('T')[0]
    };

    this.http.post('http://localhost:3000/transactions', transaction).subscribe({
      next: () => {
        this.topupAmount = 0;
        this.loadPartner();
        this.loadTransactions();
      },
      error: err => console.error('Hiba a feltöltéskor:', err)
    });
  }

  loadTransactions(): void {
    let url = `http://localhost:3000/transactions?partnerId=${this.partnerId}`;
    if (this.fromDate) url += `&from=${this.fromDate}`;
    if (this.toDate) url += `&to=${this.toDate}`;

    this.http.get<any[]>(url).subscribe(data => {
      this.transactions = data;
    });
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.loadTransactions();
  }

  filterTransactions(): void {
    this.loadTransactions();
  }
}
