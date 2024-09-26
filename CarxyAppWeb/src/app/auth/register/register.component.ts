import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  first_name: string = '';
  last_name: string = '';
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(public userService: AuthService, public router: Router) {}

  Registro() {
    const userData = {
      first_name: this.first_name,
      last_name: this.last_name,
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.userService.Registrar(userData).subscribe(
      (data: any) => {
        this.userService.AsignarToken(data.token);
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error('Error al registrar', error);
      }
    );
  }
}
