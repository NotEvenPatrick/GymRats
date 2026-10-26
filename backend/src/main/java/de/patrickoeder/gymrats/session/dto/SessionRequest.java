package de.patrickoeder.gymrats.session.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class SessionRequest {
    @NotNull
    private UUID sourceWorkoutId;

    @NotNull
    private Instant startedAt;

    @NotEmpty
    private List<@Valid SessionExerciseRequest> sessionExercises = new ArrayList<>();

    public UUID getSourceWorkoutId() {
        return sourceWorkoutId;
    }

    public void setSourceWorkoutId(UUID sourceWorkoutId) {
        this.sourceWorkoutId = sourceWorkoutId;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public List<SessionExerciseRequest> getSessionExercises() {
        return sessionExercises;
    }

    public void setSessionExercises(List<SessionExerciseRequest> sessionExercises) {
        this.sessionExercises = sessionExercises;
    }
}
