package de.patrickoeder.gymrats.session.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import java.time.Instant;

public class SessionPreviewResponse {
    private UUID sourceWorkoutId;
    private String workoutName;
    private Instant startedAt;
    private List<SessionExercisePreviewResponse> sessionExercises = new ArrayList<>();

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

    public List<SessionExercisePreviewResponse> getSessionExercises() {
        return sessionExercises;
    }

    public void setSessionExercises(List<SessionExercisePreviewResponse> sessionExercises) {
        this.sessionExercises = sessionExercises;
    }

}
