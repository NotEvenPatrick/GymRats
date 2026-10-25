import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
        canActivate: [guestGuard],
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
        canActivate: [guestGuard],
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home').then(m => m.Home),
            },
            {
                path: 'workouts',
                loadComponent: () => import('./features/workout/workout-list/workout-list').then(m => m.WorkoutList),
            },
            {
                path: 'workouts/new',
                loadComponent: () => import('./features/workout/workout-form/workout-form').then(m => m.WorkoutForm),
            },
            {
                path: 'workouts/:id/edit',
                loadComponent: () => import('./features/workout/workout-form/workout-form').then(m => m.WorkoutForm),
            },
            {
                path: 'sessions',
                loadComponent: () => import('./features/session/session-history/session-history').then(m => m.SessionHistory),
            },
            {
                path: 'sessions/start/:workoutId',
                loadComponent: () => import('./features/session/session-form/session-form').then(m => m.SessionForm),
            },
            {
                path: 'sessions/:id',
                loadComponent: () => import('./features/session/session-details/session-details').then(m => m.SessionDetails),
            },
            {
                path: 'exercises',
                loadComponent: () => import('./features/exercise/exercise-list/exercise-list').then(m => m.ExerciseList),
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'home',
    },
];
