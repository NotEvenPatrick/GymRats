package de.patrickoeder.gymrats.workout.dto;
import java.util.UUID;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class WorkoutExerciseRequest {
    @NotNull 
    private UUID exerciseId;

    @NotNull 
    @Positive

    private Integer position;
    @NotNull 
    @Positive
    private Integer plannedSets;

    @NotNull 
    @Positive
    private Integer minReps;

    @NotNull 
    @Positive
    private Integer maxReps;

    public UUID getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(UUID exerciseId) {
        this.exerciseId = exerciseId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Integer getPlannedSets() {
        return plannedSets;
    }

    public void setPlannedSets(Integer plannedSets) {
        this.plannedSets = plannedSets;
    }

    public Integer getMinReps() {
        return minReps;
    }

    public void setMinReps(Integer minReps) {
        this.minReps = minReps;
    }

    public Integer getMaxReps() {
        return maxReps;
    }

    public void setMaxReps(Integer maxReps) {
        this.maxReps = maxReps;
    }

    @AssertTrue(message = "minReps darf nicht größer als maxReps sein")
    public boolean isRepetitionRangeValid() {
        return minReps == null || maxReps == null || minReps <= maxReps;
    }
}
