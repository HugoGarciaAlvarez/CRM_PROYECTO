import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  @Output() loginSuccess = new EventEmitter<void>();

  onSubmit(): void {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Complete los campos';
      return;
    }
    if (this.username === 'admin' && this.password === 'admin') {
      this.loginSuccess.emit();
    } else {
      this.error = 'Usuario o contraseña incorrectos';
    }
  }
}