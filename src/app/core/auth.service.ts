import { Injectable } from '@angular/core';
import Keycloak, { KeycloakError, KeycloakInstance, KeycloakPromise } from 'keycloak-js';
import { environment } from '../../environments/environment';
import { UserInfo } from './models/user-info';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak!: KeycloakInstance;

  private readonly _authSuccess$ = new ReplaySubject<void>(1);

  constructor() {
    this.keycloak = new (Keycloak as unknown as { new (cfg: any): KeycloakInstance })({
      url: environment.keycloakUrl,
      realm: environment.keycloakRealm,
      clientId: environment.keycloakClientId
    });

    this.keycloak.onAuthSuccess = () => this._authSuccess$.next();
  }

  get authSuccess$(): Observable<void> {
    return this._authSuccess$.asObservable();
  }

  /** Текущий JWT */
  get token() {
    return this.keycloak.token ?? '';
  }

  /** Текущий Пользователь */
  get user() {
    const userInfo = this.keycloak.tokenParsed as UserInfo;

    return !userInfo ? undefined : this.parseUserInfo(userInfo);
  }

  get isSuperAdmin() {
    return this.keycloak.hasRealmRole('bacs-super-admin');
  }

  /**
   * Инициализация (должна быть вызвана до bootstrapApplication)
   */
  init(): KeycloakPromise<boolean, KeycloakError> {
    return this.keycloak.init({
      onLoad: 'login-required',
      flow: 'standard',
      checkLoginIframe: false,
      scope: environment.keycloakClientId
    } as Keycloak.KeycloakInitOptions);
  }

  /** Логаут */
  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  private parseUserInfo(userInfo: UserInfo) {
    return {
      user_id: userInfo['sub'] as string,
      username: userInfo['preferred_username'] as string,
      name: userInfo['name'] as string,
      picture: userInfo['picture'] as string
    };
  }
}
