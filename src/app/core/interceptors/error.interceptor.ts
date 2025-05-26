import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorSnackbarComponent } from '@shared/components/snackbar/error-snackbar/error-snackbar.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'object') {
          const problemDetails = error.error;

          this.snackBar.openFromComponent(ErrorSnackbarComponent, {
            data: {
              title: problemDetails.title,
              message: problemDetails.detail,
              errors: problemDetails.errors
            },
            panelClass: 'bacs-snackbar'
          });
        } else {
          this.snackBar.openFromComponent(ErrorSnackbarComponent, {
            data: { title: 'Неизвестная ошибка' },
            panelClass: 'bacs-snackbar'
          });
        }

        return throwError(() => error);
      })
    );
  }
}
