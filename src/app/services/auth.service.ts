import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthRequest, AuthResponse, JwtPayLoad } from '../models/Auth.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelper } from '../shared/jwt.helper';
import { tap } from 'rxjs';
import { HuespedRequest, HuespedResponse } from '../models/Huesped.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

  private authUrl: string = environment.authUrl;
  private tokenKey: string = 'auth-token';
  private payload: JwtPayLoad | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.decodeToken(); // Hay que decodificar el token al iniciarl el servicio
  }

  login(username: string, password: string) {
    let authRequest: AuthRequest = { username, password };
    return this.http.post<AuthResponse>(this.authUrl, authRequest).pipe(
      tap(Response => {
        if (Response?.token) {
          localStorage.setItem(this.tokenKey, Response.token);
          this.decodeToken();
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !JwtHelper.isTokenExpired(token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.payload = null;
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ------------------------
  // Funciones de roles y usuario
  // ------------------------

  private decodeToken(): void {
    const token = this.getToken();
    this.payload = token ? JwtHelper.decodeToken(token) : null;
  }

  getUsername(): string | null {
    return this.payload?.sub || null;
  }

  getRoles(): string[] {
    return this.payload?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  createHuesped(huesped: HuespedRequest) {
  return this.http.post<HuespedResponse>(
    'http://localhost:8089/api/huespedes',
    huesped
  );
}

updateHuesped(id: number, huesped: HuespedRequest) {
  return this.http.put<HuespedResponse>(
    `http://localhost:8089/api/huespedes/${id}`,
    huesped
  );
}

}
