package de.patrickoeder.gymrats.exercise.dto;

import de.patrickoeder.gymrats.exercise.MuscleGroup;

import java.util.UUID;

public class ExerciseResponse {
    private UUID id;
    private String name;
    private MuscleGroup muscleGroup;
    private String description;
    
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

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
