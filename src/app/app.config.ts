import { provideAnimations } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './core/auth.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ApiModule, Configuration } from './core/api';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthService,
    { provide: APP_INITIALIZER, useFactory: initKeycloak, deps: [AuthService], multi: true },
    importProvidersFrom(ApiModule.forRoot(() => new Configuration({
      basePath: environment.apiBaseUrl,
      withCredentials: false
    })))
  ]
};

export function initKeycloak(auth: AuthService) {
  return () => auth.init();
}
