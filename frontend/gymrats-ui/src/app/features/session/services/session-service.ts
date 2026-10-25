import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { SessionPreview } from '../models/session-preview';
import { Observable } from 'rxjs';
import { Session } from '../models/session';
import { SessionRequest } from '../models/session-request';
import { SessionSummary } from '../models/session-summary';

@Service()
export class SessionService {
    private http = inject(HttpClient);

    prepareSession(workoutId: string): Observable<SessionPreview> {
        return this.http.get<SessionPreview>(`/api/sessions/preview/${workoutId}`);
    }

    create(request: SessionRequest): Observable<Session> {
        return this.http.post<Session>(`/api/sessions`, request);
    }

    getHistory(): Observable<SessionSummary[]> {
        return this.http.get<SessionSummary[]>(`/api/sessions`);
    }

    getById(sessionId: string): Observable<Session> {
        return this.http.get<Session>(`/api/sessions/${sessionId}`);
    }
}
