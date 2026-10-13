import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from '../models/workout';
import { WorkoutRequest } from '../models/workout-request';

@Service()
export class WorkoutService {
    private http: HttpClient = inject(HttpClient);

    getById(id: string): Observable<Workout> {
        return this.http.get<Workout>(`/api/workouts/${id}`);
    }

    getAll(): Observable<Workout[]> {
        return this.http.get<Workout[]>('/api/workouts');
    }

    create(request: WorkoutRequest): Observable<Workout> {
        return this.http.post<Workout>('/api/workouts', request);
    }

    update(id: string, request: WorkoutRequest): Observable<Workout> {
        return this.http.put<Workout>(`/api/workouts/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/workouts/${id}`);
    }
}
