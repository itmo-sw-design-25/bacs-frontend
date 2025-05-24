import { Injectable } from '@angular/core';
import Keycloak, { KeycloakError, KeycloakInstance, KeycloakPromise } from 'keycloak-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak!: KeycloakInstance;

  constructor() {
    this.keycloak = new (Keycloak as unknown as { new(cfg: any): KeycloakInstance })({
      url: environment.keycloakUrl,
      realm: environment.keycloakRealm,
      clientId: environment.keycloakClientId
    });
  }

  /**
   * Инициализация (должна быть вызвана до bootstrapApplication)
   */
  init(): KeycloakPromise<boolean, KeycloakError> {
    return this.keycloak.init({
      onLoad: 'login-required',
      flow: 'standard',
      checkLoginIframe: false
    });
  }

  /** Текущий JWT */
  get token() {
    return this.keycloak.token ?? '';
  }

  /** Роли */
  get isAdmin() {
    return this.keycloak.hasRealmRole('admin');
  }

  get isSuperAdmin() {
    return (this.keycloak.tokenParsed as any)?.superadmin === true;
  }

  /** Логаут */
  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
