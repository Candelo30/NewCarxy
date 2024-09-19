import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { StatesService } from '../../../core/services/states.service';
import { LoadingButtonComponent } from '../loading-button/loading-button.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, LoadingButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isLoading = false;

  allPublications: any[] = [];

  ngOnInit(): void {}
}
