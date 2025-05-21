import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Machine } from '../models/machine.model';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  private apiUrl = 'http://localhost:3000/machines';

  constructor(private http: HttpClient) {}

  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(this.apiUrl);
  }

  addMachine(machine: Machine): Observable<Machine> {
    return this.http.post<Machine>(this.apiUrl, machine);
  }
}
