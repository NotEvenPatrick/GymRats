package de.patrickoeder.gymrats.session.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import de.patrickoeder.gymrats.exercise.MuscleGroup;
import de.patrickoeder.gymrats.session.SessionExerciseStatus;

public class SessionExerciseResponse {
    private UUID id;
    private UUID sourceExerciseId;
    private String exerciseName;
    private MuscleGroup muscleGroup;
    private Integer position;
    private Integer plannedSets;
    private Integer minReps;
    private Integer maxReps;
    private SessionExerciseStatus status;
    private List<SessionSetResponse> sets = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public List<SessionSetResponse> getSets() {
        return sets;
    }

    public void setSets(List<SessionSetResponse> sets) {
        this.sets = sets;
    }
}
