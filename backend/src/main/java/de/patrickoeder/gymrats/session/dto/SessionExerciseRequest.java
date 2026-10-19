package de.patrickoeder.gymrats.session.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import de.patrickoeder.gymrats.exercise.MuscleGroup;
import de.patrickoeder.gymrats.session.SessionExerciseStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * SessionExerciseRequest
 */
public class SessionExerciseRequest {
    @NotNull
    private UUID sourceExerciseId;

    @NotBlank
    private String exerciseName;

    @NotNull
    private MuscleGroup muscleGroup;

    @NotNull
    @Min(1)
    private Integer position;

    @NotNull
    @Min(1)
    private Integer plannedSets;

    @NotNull
    @Min(1)
    private Integer minReps;

    @NotNull
    @Min(1)
    private Integer maxReps;

    @NotNull
    private SessionExerciseStatus status;

    @NotNull
    @Valid
    private List<SessionSetRequest> sets = new ArrayList<>();

    public UUID getSourceExerciseId() {
        return sourceExerciseId;
    }

    public void setSourceExerciseId(UUID sourceExerciseId) {
        this.sourceExerciseId = sourceExerciseId;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
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

    public SessionExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(SessionExerciseStatus status) {
        this.status = status;
    }

    public List<SessionSetRequest> getSets() {
        return sets;
    }

    public void setSets(List<SessionSetRequest> sets) {
        this.sets = sets;
    }
}
