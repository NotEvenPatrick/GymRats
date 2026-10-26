package de.patrickoeder.gymrats.session;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import de.patrickoeder.gymrats.exercise.MuscleGroup;

@Entity
public class SessionExercise {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private UUID sourceExerciseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MuscleGroup muscleGroup;

    @Column(nullable = false)
    private Integer position;

    @Column(nullable = false)
    private Integer plannedSets;

    @Column(nullable = false)
    private Integer minReps;

    @Column(nullable = false)
    private Integer maxReps;

    @OneToMany(mappedBy = "sessionExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionSet> sets = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public UUID getSourceExerciseId() {
        return sourceExerciseId;
    }

    public void setSourceExerciseId(UUID sourceExerciseId) {
        this.sourceExerciseId = sourceExerciseId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
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

    public List<SessionSet> getSets() {
        return sets;
    }

    public void addSet(SessionSet set) {
        sets.add(set);
        set.setSessionExercise(this);
    }

    public void removeSet(SessionSet set) {
        sets.remove(set);
        set.setSessionExercise(null);
    }
}
