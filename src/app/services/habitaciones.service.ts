import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../environments/environment';
import {
    HabitacionRequest,
    HabitacionResponse
} from '../models/Habitacion.model';

@Injectable({
    providedIn: 'root'
})
export class HabitacionesService {

    private apiUrl = environment.apiUrl.concat('habitaciones');

    constructor(private http: HttpClient) { }

    getHabitaciones(): Observable<HabitacionResponse[]> {
        return this.http.get<HabitacionResponse[]>(this.apiUrl).pipe(
            map(resp => resp.sort()),
            catchError(error => {
                console.error('Error al obtener habitaciones', error);
                return of([]);
            })
        );
    }

    postHabitacion(data: HabitacionRequest): Observable<HabitacionResponse> {
        return this.http.post<HabitacionResponse>(this.apiUrl, data);
    }

    putHabitacion(
        data: HabitacionRequest,
        id: number
    ): Observable<HabitacionResponse> {
        return this.http.put<HabitacionResponse>(`${this.apiUrl}/${id}`, data);
    }

    deleteHabitacion(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
