import { Routes } from '@angular/router';
import { MachinesComponent } from './pages/machines/machines.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { PartnerDetailsComponent } from './pages/partner-details/partner-details.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: '', component: MachinesComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'partners/:id', component: PartnerDetailsComponent }, 
];
