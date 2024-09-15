import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

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

  constructor(public userService: AuthService, public router: Router) {}

  Login() {
    const user = { username: this.username, password: this.password };
    this.userService.IniciarSesion(user).subscribe((data) => {
      this.userService.AsignarToken(data.token);

      this.router.navigate(['/home']);
    });
  }
}
