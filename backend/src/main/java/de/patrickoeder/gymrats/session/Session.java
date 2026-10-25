package de.patrickoeder.gymrats.session;

import org.hibernate.annotations.UuidGenerator;

import de.patrickoeder.gymrats.user.User;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.Entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
public class Session {
    @Id
    @UuidGenerator
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotNull
    private UUID sourceWorkoutId;

    @NotBlank
    private String workoutName;

    @NotNull
    private Instant startedAt;

    @NotNull
    private Instant endedAt;

    @NotNull
    @Valid
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionExercise> sessionExercises = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public UUID getSourceWorkoutId() {
        return sourceWorkoutId;
    }

    public void setSourceWorkoutId(UUID sourceWorkoutId) {
        this.sourceWorkoutId = sourceWorkoutId;
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

    public List<SessionExercise> getSessionExercises() {
        return sessionExercises;
    }

    public void addSessionExercise(SessionExercise sessionExercise) {
        sessionExercises.add(sessionExercise);
        sessionExercise.setSession(this);
    }

    public void removeSessionExercise(SessionExercise sessionExercise) {
        sessionExercises.remove(sessionExercise);
        sessionExercise.setSession(null);
    }

    @AssertTrue(message = "endedAt darf nicht vor startedAt liegen")
    public boolean isTimeRangeValid() {
        return startedAt == null || endedAt == null || !endedAt.isBefore(startedAt);
    }
}
