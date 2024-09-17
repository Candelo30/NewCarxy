import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { StatesService } from '../../../core/services/states.service';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LoadingButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isOpenMenu = false;
  userProfilePicture: string | null = null;
  userName: string = '';
  roleUser = false;
  selectedColor: string = '';
  isLoading = false;

  constructor(
    private cookieService: CookieService,
    private elRef: ElementRef,
    private authService: AuthService,
    private UserData: UserService,
    private states: StatesService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Verificar si el clic fue fuera del elemento modal
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpenMenu = false;
    }
  }

  ngOnInit(): void {
    this.loadUserData();
    this.states.getColor().subscribe((response) => {
      this.selectedColor = response;
    });
  }

  private loadUserData(): void {
    this.UserData.DataUser().subscribe((data) => {
      this.userName = data.username;
      this.roleUser = data.is_staff;
      if (data.foto_perfil) {
        this.userProfilePicture = 'http://localhost:8000/' + data.foto_perfil;
      }
    });
    // -----------------
  }

  ToggleMenu() {
    this.isOpenMenu = !this.isOpenMenu;
  }

  // Obtiene las iniciales del nombre
  getInitials(name: string): string {
    const initials = name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    return initials.toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}
