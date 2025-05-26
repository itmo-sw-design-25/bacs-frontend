import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from '@core/auth.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '@core/interceptors/auth.interceptor';
import { ApiModule, Configuration } from '@core/api';
import { environment } from '../environments/environment';
import { DateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ErrorInterceptor } from '@core/interceptors/error.interceptor';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { CustomDateAdapter } from '@shared/components/date/custom-date-adapter.component';

const provideCore = () =>
  [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideAnimationsAsync(),
    provideNativeDateAdapter()
  ];

const provideLocalization = () =>
  [
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ];

const provideApiModule = () =>
  [
    importProvidersFrom(
      ApiModule.forRoot(() => new Configuration({
        basePath: environment.apiBaseUrl,
        withCredentials: false
      })))
  ];

const provideAppServices = () => [
  AuthService,
  {
    provide: APP_INITIALIZER,
    useFactory: (auth: AuthService) => () => auth.init(),
    deps: [AuthService],
    multi: true
  }
];

const provideInterceptors = () => [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];

const provideMaterialDefaults = () => [
  { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
  { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
  {
    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
    useValue: {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    }
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideCore(),
    ...provideLocalization(),
    ...provideApiModule(),
    ...provideAppServices(),
    ...provideInterceptors(),
    ...provideMaterialDefaults()
  ]
};
