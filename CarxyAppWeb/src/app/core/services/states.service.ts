import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatesService {
  private blueToPurple: string[] = [
    '#A230F7',
    '#686DFD',
    '#01E9F5',
    '#94F8CC',
    '#F35BD6',
  ];

  // BehaviorSubject almacena el valor inicial y lo emite a los suscriptores
  private colorSubject: BehaviorSubject<string>;

  constructor() {
    // Genera un color aleatorio solo una vez
    const randomIndex = Math.floor(Math.random() * this.blueToPurple.length);
    const randomColor = this.blueToPurple[randomIndex];

    // Inicializa el BehaviorSubject con el color generado
    this.colorSubject = new BehaviorSubject<string>(randomColor);
  }

  // Método para obtener el color actual (observado)
  getColor() {
    return this.colorSubject.asObservable(); // Devuelve un Observable para que los componentes se suscriban
  }
}
