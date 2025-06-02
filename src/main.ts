import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeRu);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
