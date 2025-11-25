import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'crmAngularSIII';

  isLoggedIn = false; // asegurar false por defecto
  error = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('AppComponent init, isLoggedIn =', this.isLoggedIn);
    // si antes usabas localStorage y quieres desactivarlo temporalmente, comenta/borra esa lectura
    // this.isLoggedIn = localStorage.getItem('isLoggedIn') === '1';
  }

  handleLogin(): void {
    this.isLoggedIn = true;
    console.log('login ok -> navegar a /inicio');
    this.router.navigate(['/inicio']);
  }

  logout(): void {
    this.isLoggedIn = false;
    console.log('logout');
    this.router.navigate(['/']);
  }
}
