import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';

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

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Complete los campos';
      return;
    }

    this.authService.login(this.username, this.password)
      .subscribe({
        next: (resp) => {
          // resp.token viene del LoginResponse del backend
          localStorage.setItem("token", resp.token);
          

          this.loginSuccess.emit();  // Le avisamos al padre (AppComponent)
        },
        error: () => {
          this.error = 'Usuario o contraseña incorrectos';
        }
      });
  }
}
