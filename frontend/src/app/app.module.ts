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

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { AuthService } from './services/http-api/auth.service';
import { BusinessService } from './services/http-api/business.service';
import { ServicesService } from './services/http-api/services.service';
import { ReservationsService } from './services/http-api/reservations.service';

import { TokenInterceptor, ErrorInterceptor } from './services/http-interceptor.service';

import { AuthEffects } from './store/effects/auth.effects';
import { BusinessEffects } from './store/effects/business.effects';
import { ServicesEffects } from './store/effects/services.effects';
import { ReservationsEffects } from './store/effects/reservations.effects';

import { reducers } from './store/app.states';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';

import { AuthGuardService as AuthGuard } from './services/auth-guard.service';

import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { CalendarHeaderComponent } from './common/components/calendar-header/calendar-header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { NgSelectModule } from '@ng-select/ng-select';

import { AdminComponent } from './pages/admin/admin.component';
import { AdminPlansComponent } from './pages/admin/plans/plans.component';
import { AdminBusinessComponent } from './pages/admin/business/business.component';
import { AdminServicesComponent } from './pages/admin/services/services.component';

import { ModalReservationComponent } from './common/modals/reservation/reservation.component';

import { registerLocaleData } from '@angular/common';
import localeIta from '@angular/common/locales/it';
import { AdminSidebarComponent } from './common/components/admin-sidebar/admin-sidebar.component';

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
    AdminServicesComponent,
    ModalReservationComponent,
    AdminSidebarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    NgSelectModule,
    HttpClientModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    LoadingBarModule,
    ToastrModule.forRoot(),
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([AuthEffects, BusinessEffects, ServicesEffects, ReservationsEffects]),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
  providers: [
    AuthService,
    BusinessService,
    ServicesService,
    ReservationsService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'it-IT'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
