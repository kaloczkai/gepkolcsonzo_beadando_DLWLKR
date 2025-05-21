import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../models/partner.model';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private apiUrl = 'http://localhost:3000/partners';

  constructor(private http: HttpClient) {}

  getPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.apiUrl);
  }

  addPartner(partner: Partner): Observable<Partner> {
    return this.http.post<Partner>(this.apiUrl, partner);
  }

  updatePartner(id: number, updated: Partial<Partner>): Observable<Partner> {
    return this.http.put<Partner>(`${this.apiUrl}/${id}`, updated);
  }

  getPartner(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.apiUrl}/${id}`);
  }
}
