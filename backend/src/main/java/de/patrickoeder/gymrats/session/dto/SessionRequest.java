package de.patrickoeder.gymrats.session.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import de.patrickoeder.gymrats.session.SessionStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class SessionRequest {
    @NotNull
    private UUID sourceWorkoutId;

    @NotBlank
    private String workoutName;

    @NotNull
    private Instant startedAt;

    @NotNull
    private SessionStatus status;

    @NotEmpty
    @Valid
    private List<SessionExerciseRequest> sessionExercises = new ArrayList<>();

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

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public List<SessionExerciseRequest> getSessionExercises() {
        return sessionExercises;
    }

    public void setSessionExercises(List<SessionExerciseRequest> sessionExercises) {
        this.sessionExercises = sessionExercises;
    }
}
