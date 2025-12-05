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
  isSidebarOpen = false;
  constructor(private router: Router) { }

  handleLogin() {
    this.isLoggedIn = true;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
