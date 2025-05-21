import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MachineService } from '../../services/machine.service';
import { Machine } from '../../models/machine.model';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './machines.component.html',
})
export class MachinesComponent {
  machines: Machine[] = [];
  errorMessage: string = '';

  newMachine: Machine = {
    code: '',
    name: '',
    brand: '',
    type: '',
    powerWatt: null,
    weightKg: null,
    deposit: null,
    dailyRate: null,
  };

  constructor(private machineService: MachineService) {
    this.loadMachines();
  }

  loadMachines(): void {
    this.machineService.getMachines().subscribe((data) => {
      this.machines = data;
    });
  }

  onSubmit(): void {
    const codePattern = /^[0-9]{6}$/;
    if (!codePattern.test(this.newMachine.code)) {
      this.errorMessage = 'A gépkódnak pontosan 6 számjegyből kell állnia.';
      return;
    }

    this.machineService.addMachine(this.newMachine).subscribe({
      next: (added) => {
        this.machines.push(added);
        this.newMachine = {
          code: '',
          name: '',
          brand: '',
          type: '',
          powerWatt: null,
          weightKg: null,
          deposit: null,
          dailyRate: null,
        };
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Hiba történt a gép hozzáadása során.';
      }
    });
  }
}
