import { Routes } from '@angular/router';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';
import { Home } from './pages/home/home';
import { authGuard } from './core/guards/auth-guard';
import { ExerciseList } from './features/exercise/exercise-list/exercise-list';
import { WorkoutList } from './features/workout/workout-list/workout-list';
import { WorkoutForm } from './features/workout/workout-form/workout-form';

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
        path: 'workouts',
        component: WorkoutList,
        canActivate: [authGuard],
    },
    {
        path: 'workouts/new',
        component: WorkoutForm,
        canActivate: [authGuard],
    },
    {
        path: 'workouts/:id/edit',
        component: WorkoutForm,
        canActivate: [authGuard],
    },
    {
        path: 'exercises',
        component: ExerciseList,
        canActivate: [authGuard],
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];
