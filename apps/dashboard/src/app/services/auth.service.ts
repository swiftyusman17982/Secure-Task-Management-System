
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { User, AuthResponse } from 'secure-task-management-system/data';

@Injectable({
        providedIn: 'root'
})
export class AuthService {
        private readonly API_URL = 'http://localhost:3000/api/auth';
        private readonly TOKEN_KEY = 'auth_token';
        private readonly USER_KEY = 'auth_user';

        currentUser = signal<User | null>(this.getStoredUser());
        isAuthenticated = computed(() => !!this.currentUser());

        constructor(private http: HttpClient, private router: Router) { }

        login(username: string, password: string): Observable<AuthResponse> {
                return this.http.post<AuthResponse>(`${this.API_URL}/login`, { username, password }).pipe(
                        tap(res => {
                                this.setSession(res);
                        })
                );
        }

        logout() {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.USER_KEY);
                this.currentUser.set(null);
                this.router.navigate(['/login']);
        }

        private setSession(authResult: AuthResponse) {
                localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
                localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
                this.currentUser.set(authResult.user);
        }

        getToken(): string | null {
                return localStorage.getItem(this.TOKEN_KEY);
        }

        private getStoredUser(): User | null {
                const userJson = localStorage.getItem(this.USER_KEY);
                return userJson ? JSON.parse(userJson) : null;
        }
}
