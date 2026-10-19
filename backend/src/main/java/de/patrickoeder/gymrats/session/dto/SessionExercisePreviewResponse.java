package de.patrickoeder.gymrats.session.dto;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

import de.patrickoeder.gymrats.exercise.MuscleGroup;
import de.patrickoeder.gymrats.session.SessionExerciseStatus;
import jakarta.validation.constraints.AssertTrue;

public class SessionExercisePreviewResponse {
    private UUID sourceExerciseId;
    private String exerciseName;
    private MuscleGroup muscleGroup;
    private int position;
    private int plannedSets;
    private int minReps;
    private int maxReps;
    private SessionExerciseStatus status;
    private List<SessionSetPreviewResponse> sets = new ArrayList<>();

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

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public int getPlannedSets() {
        return plannedSets;
    }

    public void setPlannedSets(int plannedSets) {
        this.plannedSets = plannedSets;
    }

    public int getMinReps() {
        return minReps;
    }

    public void setMinReps(int minReps) {
        this.minReps = minReps;
    }

    public int getMaxReps() {
        return maxReps;
    }

    public void setMaxReps(int maxReps) {
        this.maxReps = maxReps;
    }

    public SessionExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(SessionExerciseStatus status) {
        this.status = status;
    }

    public List<SessionSetPreviewResponse> getSets() {
        return sets;
    }

    public void setSets(List<SessionSetPreviewResponse> sets) {
        this.sets = sets;
    }

    @AssertTrue(message = "minReps darf nicht größer als maxReps sein")
    public boolean isRepetitionRangeValid() {
        return minReps <= maxReps;
    }
}
