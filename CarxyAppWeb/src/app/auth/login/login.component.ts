import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    public userService: AuthService,
    public router: Router,
    private cookieService: CookieService
  ) {}

  Login() {
    const user = { username: this.username, password: this.password };
    this.userService.IniciarSesion(user).subscribe((data) => {
      if (data.token) {
        this.userService.AsignarToken(data.token);
      }
      if (data.user) {
        this.cookieService.set('loggedInUser', JSON.stringify(data.user), 7); // Expira en 7 días
      }

      this.router.navigate(['/home']);
    });
  }
}
