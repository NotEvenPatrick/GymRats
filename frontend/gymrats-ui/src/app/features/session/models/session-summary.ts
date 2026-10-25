import { SessionStatus } from "./status";

export interface SessionSummary {
    id: string;
    workoutName: string;
    startedAt: string;
    endedAt: string;
    status: SessionStatus;
    exerciseCount: number;
}