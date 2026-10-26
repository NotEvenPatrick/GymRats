package de.patrickoeder.gymrats.workout;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import de.patrickoeder.gymrats.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Workout {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "workout",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();

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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public List<WorkoutExercise> getWorkoutExercises() {
        return workoutExercises;
    }

    public void addWorkoutExercise(WorkoutExercise workoutExercise) {
        workoutExercises.add(workoutExercise);
        workoutExercise.setWorkout(this);
    }

    public void removeWorkoutExercise(WorkoutExercise workoutExercise) {
        workoutExercises.remove(workoutExercise);
        workoutExercise.setWorkout(null);
    }
}
