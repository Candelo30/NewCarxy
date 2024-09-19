import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.css',
})
export class LoadingButtonComponent {
  @Input() isLoading: boolean = false;
}
