import { Component, OnInit } from '@angular/core';
import { Roles } from '../../../constants/Roles';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  username: string | null = null;
  showMenuAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    if(this.authService.hasRole(Roles.ADMIN)) {
      this.showMenuAdmin = true;
    }
  }

  logout(): void {
    this.authService.logout();
  }

}
