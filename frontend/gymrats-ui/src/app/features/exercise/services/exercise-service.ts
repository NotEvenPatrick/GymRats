import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Exercise } from '../models/exercise';
import { Observable } from 'rxjs';
import { ExerciseRequest } from '../models/exercise-request';

@Service()
export class ExerciseService {
    private http = inject(HttpClient);

    getAll(): Observable<Exercise[]> {
        return this.http.get<Exercise[]>('/api/exercises');
    }

    getById(id: string): Observable<Exercise> {
        return this.http.get<Exercise>(`/api/exercises/${id}`);
    }

    create(request: ExerciseRequest): Observable<Exercise> {
        return this.http.post<Exercise>('/api/exercises', request);
    }

    update(id: string, request: ExerciseRequest): Observable<Exercise> {
        return this.http.put<Exercise>(`/api/exercises/${id}`, request);
    }
    
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/exercises/${id}`);
    }
}
