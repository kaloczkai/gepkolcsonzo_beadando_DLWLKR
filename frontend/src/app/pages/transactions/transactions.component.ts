import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  partners: any[] = [];
  machines: any[] = [];
  rentals: any[] = [];
  errorMessage: string = '';

  newRental = {
    partnerId: null,
    machineId: null,
    startDate: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<any[]>('http://localhost:3000/rentals').subscribe(data => {
      this.rentals = data;
    });

    this.http.get<any[]>('http://localhost:3000/partners').subscribe(data => {
      this.partners = data;
    });

    this.http.get<any[]>('http://localhost:3000/machines').subscribe(data => {
      this.machines = data;
    });
  }

  createRental(): void {
    this.errorMessage = '';
    const partner = this.partners.find(p => p.id === this.newRental.partnerId);
    if (partner && partner.balance < -50000) {
      this.errorMessage = 'Ez a partner túl nagy tartozással rendelkezik, nem kölcsönözhet!';
      return;
    }

    this.http.post('http://localhost:3000/rentals', this.newRental).subscribe({
      next: () => {
        alert('Kölcsönzés rögzítve');
        this.newRental = { partnerId: null, machineId: null, startDate: '' };
        this.loadAll();
      },
      error: err => {
        this.errorMessage = 'Hiba a kölcsönzéskor.';
        console.error(err);
      }
    });
  }

  closeRental(rental: any): void {
    this.http.put(`http://localhost:3000/rentals/${rental.id}/close`, {
      endDate: rental.endDate,
      intact: rental.intact ?? true
    }).subscribe({
      next: () => {
        rental.returned = true;
      },
      error: err => console.error('Hiba a lezáráskor:', err)
    });
  }
}
