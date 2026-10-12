package de.patrickoeder.gymrats.workout;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import de.patrickoeder.gymrats.exercise.Exercise;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.persistence.Entity;

@Entity
public class WorkoutExercise {
    @Id
    @UuidGenerator 
    private UUID id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "workout_id", nullable = false) 
    private Workout workout;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false) 
    private Exercise exercise;

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


    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Workout getWorkout() {
        return workout;
    }

    public void setWorkout(Workout workout) {
        this.workout = workout;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
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
}
