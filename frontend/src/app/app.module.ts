import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthService } from './services/auth.service';
import { BusinessService } from './services/business.service';
import { ServicesService } from './services/services.service';

import { TokenInterceptor, ErrorInterceptor } from './services/http-interceptor.service';

import { AuthEffects } from './store/effects/auth.effects';
import { BusinessEffects } from './store/effects/business.effects';
import { ServicesEffects } from './store/effects/services.effects';

import { reducers } from './store/app.states';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';

import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { AdminComponent } from './admin/admin.component';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { registerLocaleData } from '@angular/common';
import localeIta from '@angular/common/locales/it';

import { AdminPlansComponent } from './admin-plans/admin-plans.component';
import { AdminBusinessComponent } from './admin-business/admin-business.component';
import { AdminServicesComponent } from './admin-services/admin-services.component';
registerLocaleData(localeIta);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    DashboardComponent,
    AdminComponent,
    CalendarHeaderComponent,
    AdminPlansComponent,
    AdminBusinessComponent,
    AdminServicesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    LoadingBarModule,
    ToastrModule.forRoot(),
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([AuthEffects, BusinessEffects, ServicesEffects]),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
  providers: [
    AuthService,
    BusinessService,
    ServicesService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'it-IT'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
