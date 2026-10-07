import { Routes } from '@angular/router';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'register',
        component: Register,
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'home',
        component: Home,
        canActivate: [authGuard],
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
