// src/app/models/notification.model.ts

export interface Notification {
  id?: string; // ID único para cada notificación
  type: 'alert' | 'notification' | 'message'; // Tipo de mensaje
  message: string; // Contenido del mensaje
  duration?: number; // Tiempo de duración en ms (opcional)
  dismissible?: boolean; // Si el mensaje se puede cerrar manualmente
  actions?: NotificationAction[]; // Botones o acciones opcionales
  icon?: IconType; // Ícono opcional para el mensaje, tipo restringido
  style?: 'success' | 'error' | 'info' | 'warning'; // Estilo visual
  timeoutId?: NodeJS.Timeout; // ID del timeout para eliminar la notificación
}

// Definición del tipo de acción
export interface NotificationAction {
  label: string; // Texto del botón
  action: () => void; // Función a ejecutar cuando el botón es presionado
}

// Tipos de icono permitidos
export type IconType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'custom'
  | string;
