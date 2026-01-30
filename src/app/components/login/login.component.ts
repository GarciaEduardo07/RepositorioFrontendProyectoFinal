import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class Login implements OnInit{
  
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authservice: AuthService) {}
  
  ngOnInit(): void {
    if(this.authservice) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.authservice.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {this.error = 'Credenciales invalidas'; }
    })
    
  }
}