import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { UsuarioRequest, UsuarioResponse } from '../models/Usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl: string = environment.apiUsuarios; 

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl).pipe(
      catchError(e => throwError(() => e))
    );
  }

  createUsuario(usuario: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario).pipe(
      catchError(e => throwError(() => e))
    );
  }

  deleteUsuario(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${username}`).pipe(
      catchError(e => throwError(() => e))
    );
  }
}
