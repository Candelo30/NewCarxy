import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { HelpService } from '../../../core/services/help.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
})
export class HelpComponent {
  articles: any[] = [];
  faqs: any[] = [];

  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    this.loadHelpData();
  }

  loadHelpData(): void {
    // Cargar artículos desde la API
    this.helpService.getArticles().subscribe(
      (data) => {
        this.articles = data;
        console.log(data);
      },
      (error) => console.error('Error loading articles', error)
    );

    // Cargar FAQs desde la API
    this.helpService.getFAQs().subscribe(
      (data) => {
        this.faqs = data;
        console.log(data);
      },
      (error) => console.error('Error loading FAQs', error)
    );
  }
}
