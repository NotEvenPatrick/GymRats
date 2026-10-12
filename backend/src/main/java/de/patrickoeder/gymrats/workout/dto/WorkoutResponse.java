package de.patrickoeder.gymrats.workout.dto;

import java.util.List;
import java.util.UUID;

public class WorkoutResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID ownerId;
    private List<WorkoutExerciseResponse> exercises;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public List<WorkoutExerciseResponse> getExercises() {
        return exercises;
    }

    public void setExercises(List<WorkoutExerciseResponse> exercises) {
        this.exercises = exercises;
    }


}
