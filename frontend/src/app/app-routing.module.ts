import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { AuthGuardService as AuthGuard } from './services/auth-guard.service';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminBusinessComponent } from './pages/admin/business/business.component';
import { AdminPlansComponent } from './pages/admin/plans/plans.component';
import { AdminServicesComponent } from './pages/admin/services/services.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  /*{ path: 'admin',  redirectTo: '/admin/business', pathMatch: 'full' },*/
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/business', component: AdminBusinessComponent, canActivate: [AuthGuard] },
  { path: 'admin/plans', component: AdminPlansComponent, canActivate: [AuthGuard] },
  { path: 'admin/services', component: AdminServicesComponent, canActivate: [AuthGuard] },
  { path: '',   redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
