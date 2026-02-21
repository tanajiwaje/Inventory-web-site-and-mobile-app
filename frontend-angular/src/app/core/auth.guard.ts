import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.ready()) return false;
  if (!auth.token()) {
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};
