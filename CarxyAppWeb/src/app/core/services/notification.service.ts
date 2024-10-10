import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../../interface/notifications/notification.model';
import { v4 as uuidv4 } from 'uuid'; // Importa uuid para generar IDs únicos

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Almacena las notificaciones en un BehaviorSubject
  private _notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();

  constructor() {}

  /**
   * Agrega una nueva notificación.
   * @param notification - El objeto de notificación a agregar.
   */
  addNotification(notification: Notification) {
    // Validar que la notificación tenga un mensaje y un tipo de estilo
    if (!notification.message || !notification.style) {
      console.error('Notification must have a message and a style');
      return;
    }

    // Generar ID único para la notificación
    notification.id = this.generateId();

    // Agregar la nueva notificación a la lista
    this._notifications.next([...this._notifications.getValue(), notification]);

    // Si se establece una duración, eliminar automáticamente después del tiempo
    if (notification.duration && notification.duration > 0) {
      const timeoutId = setTimeout(() => {
        this.removeNotification(notification.id!);
      }, notification.duration);

      // Asignar el timeout ID a la notificación para poder limpiarlo si es necesario
      notification.timeoutId = timeoutId;
    }
  }

  /**
   * Elimina una notificación por su ID.
   * @param id - ID de la notificación a eliminar.
   */
  removeNotification(id: string) {
    const currentNotifications = this._notifications.getValue();
    const updatedNotifications = currentNotifications.filter(
      (n) => n.id !== id
    );

    // Actualizar la lista de notificaciones
    this._notifications.next(updatedNotifications);

    // Limpiar el timeout si existe
    const notification = currentNotifications.find((n) => n.id === id);
    if (notification && notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
  }

  /**
   * Genera un ID único para la notificación.
   * @returns Un ID único como cadena.
   */
  private generateId(): string {
    return uuidv4(); // Utiliza la librería uuid para generar un ID único
  }
}
