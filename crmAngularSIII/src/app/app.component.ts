import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crmAngularSIII';
  isLoggedIn = false; // iniciar en false para mostrar login
  error = '';

  constructor(private router: Router) {}

  handleLogin(): void {
    this.isLoggedIn = true;
    this.router.navigate(['/inicio']);
  }

  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
