import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; // removed unused operators for clean start
import { environment } from '../environments/environment';
import { ReservaRequest, ReservaResponse } from '../models/Reserva.model';

@Injectable({
    providedIn: 'root'
})
export class ReservasService {

    private apiUrl = environment.apiUrl.concat('reservas');

    constructor(private http: HttpClient) { }

    getReservas(): Observable<ReservaResponse[]> {
        return this.http.get<ReservaResponse[]>(this.apiUrl);
    }

    postReserva(data: ReservaRequest): Observable<ReservaResponse> {
        return this.http.post<ReservaResponse>(this.apiUrl, data);
    }

    putReserva(data: ReservaRequest, id: number): Observable<ReservaResponse> {
        return this.http.put<ReservaResponse>(`${this.apiUrl}/${id}`, data);
    }

    deleteReserva(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    checkIn(id: number): Observable<ReservaResponse> {
        return this.http.put<ReservaResponse>(`${this.apiUrl}/${id}/check-in`, {});
    }

    checkOut(id: number): Observable<ReservaResponse> {
        return this.http.put<ReservaResponse>(`${this.apiUrl}/${id}/check-out`, {});
    }

    // 4L is CANCELADA based on Java Enum
    cancelarReserva(id: number): Observable<ReservaResponse> {
        return this.http.put<ReservaResponse>(`${this.apiUrl}/${id}/estado/4`, {});
    }
}
