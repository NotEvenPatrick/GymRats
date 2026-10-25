package de.patrickoeder.gymrats.session.dto;

import java.time.Instant;
import java.util.UUID;

public class SessionSummaryResponse {
    private UUID id;
    private String workoutName;
    private Instant startedAt;
    private Instant endedAt;
    private Integer exerciseCount;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public Integer getExerciseCount() {
        return exerciseCount;
    }

    public void setExerciseCount(Integer exerciseCount) {
        this.exerciseCount = exerciseCount;
    }
}
