import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
        canActivate: [authGuard],
    },
    {
        path: 'workouts',
        loadComponent: () => import('./features/workout/workout-list/workout-list').then(m => m.WorkoutList),
        canActivate: [authGuard],
    },
    {
        path: 'workouts/new',
        loadComponent: () => import('./features/workout/workout-form/workout-form').then(m => m.WorkoutForm),
        canActivate: [authGuard],
    },
    {
        path: 'workouts/:id/edit',
        loadComponent: () => import('./features/workout/workout-form/workout-form').then(m => m.WorkoutForm),
        canActivate: [authGuard],
    },
    {
        path: 'sessions',
        loadComponent: () => import('./features/session/session-history/session-history').then(m => m.SessionHistory),
        canActivate: [authGuard],
    },
    {
        path: 'sessions/:id',
        loadComponent: () => import('./features/session/session-details/session-details').then(m => m.SessionDetails),
        canActivate: [authGuard],
    },
    {
        path: 'sessions/start/:workoutId',
        loadComponent: () => import('./features/session/session-form/session-form').then(m => m.SessionForm),
        canActivate: [authGuard],
    },
    {
        path: 'exercises',
        loadComponent: () => import('./features/exercise/exercise-list/exercise-list').then(m => m.ExerciseList),
        canActivate: [authGuard],
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
