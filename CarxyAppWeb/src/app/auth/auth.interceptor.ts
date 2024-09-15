import { HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).ObtenerToken();

  const authreq = req.clone({
    setHeaders: {
      Authorization: `Token ${token}`,
    },
  });
  return next(authreq);
};
