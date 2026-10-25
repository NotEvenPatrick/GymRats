package de.patrickoeder.gymrats.session.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public class SessionResponse {
    private UUID id;
    private UUID sourceWorkoutId;
    private String workoutName;
    private Instant startedAt;
    private Instant endedAt;
    private List<SessionExerciseResponse> sessionExercises = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID sessionId) {
        this.id = sessionId;
    }

    public UUID getSourceWorkoutId() {
        return sourceWorkoutId;
    }

    public void setSourceWorkoutId(UUID sourceWorkoutId) {
        this.sourceWorkoutId = sourceWorkoutId;
    }

    public String getWorkoutName() {
        return workoutName;
    }

    public void setWorkoutName(String workoutName) {
        this.workoutName = workoutName;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public List<SessionExerciseResponse> getSessionExercises() {
        return sessionExercises;
    }

    public void setSessionExercises(List<SessionExerciseResponse> sessionExercises) {
        this.sessionExercises = sessionExercises;
    }

}
