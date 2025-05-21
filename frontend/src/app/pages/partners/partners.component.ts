import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Partner } from '../../models/partner.model';
import { PartnerService } from '../../services/partner.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './partners.component.html',
})
export class PartnersComponent {
  partners: Partner[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  // új partner hozzáadás
  newPartner = {
    name: '',
    representative: '',
    taxNumber: '',
    companyNumber: '',
    headquarters: ''
  };

  // partner szerkesztés
  editingPartnerId: number | null = null;
  editedPartner: Partial<Partner> = {};

  // egyenlegfeltöltés
  topupPartnerId: number | null = null;
  topupAmount: number = 0;

  constructor(
    private partnerService: PartnerService,
    private transactionService: TransactionService
  ) {
    this.loadPartners();
  }

  loadPartners(): void {
    this.partnerService.getPartners().subscribe((data) => {
      this.partners = data;
    });
  }

  onSubmit(): void {
    const partnerToSend: Partner = {
      name: this.newPartner.name,
      representative: this.newPartner.representative,
      taxNumber: this.newPartner.taxNumber,
      companyNumber: this.newPartner.companyNumber,
      headquarters: this.newPartner.headquarters,
      balance: 15000
    };

    this.partnerService.addPartner(partnerToSend).subscribe({
      next: (added) => {
        this.partners.push(added);
        this.newPartner = {
          name: '', representative: '', taxNumber: '', companyNumber: '', headquarters: ''
        };
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Hiba történt a partner hozzáadása során.';
      }
    });
  }

  startEditing(partner: Partner): void {
    this.editingPartnerId = partner.id!;
    this.editedPartner = { ...partner };
  }

  saveEdit(): void {
    if (this.editingPartnerId !== null) {
      this.partnerService.updatePartner(this.editingPartnerId, this.editedPartner)
        .subscribe({
          next: (updated) => {
            const index = this.partners.findIndex(p => p.id === this.editingPartnerId);
            if (index !== -1) {
              this.partners[index] = updated;
            }
            this.editingPartnerId = null;
            this.editedPartner = {};
            this.errorMessage = '';
          },
          error: () => {
            this.errorMessage = 'Hiba történt a partner módosítása során.';
          }
        });
    }
  }

  cancelEdit(): void {
    this.editingPartnerId = null;
    this.editedPartner = {};
  }

  topUp(): void {
    if (!this.topupPartnerId || this.topupAmount <= 0) {
      this.errorMessage = 'Adj meg érvényes összeget és válassz partnert.';
      return;
    }

    this.transactionService.createTransaction({
      partnerId: this.topupPartnerId,
      type: 'credit',
      amount: this.topupAmount,
      date: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.successMessage = 'Egyenleg sikeresen feltöltve.';
        this.errorMessage = '';
        this.topupAmount = 0;
        this.loadPartners();
      },
      error: () => {
        this.successMessage = '';
        this.errorMessage = 'Hiba történt a feltöltés során.';
      }
    });
  }
}