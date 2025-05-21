import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MachinesComponent } from '../machines/machines.component';
import { PartnersComponent } from '../partners/partners.component';
import { TransactionsComponent } from '../transactions/transactions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MachinesComponent, PartnersComponent, TransactionsComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  selectedView: 'machines' | 'partners' | 'transactions' = 'machines';

  show(view: 'machines' | 'partners' | 'transactions') {
    this.selectedView = view;
  }
}
