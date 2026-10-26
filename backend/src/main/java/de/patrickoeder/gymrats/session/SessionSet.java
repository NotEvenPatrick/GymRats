package de.patrickoeder.gymrats.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
public class SessionSet {
    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_exercise_id", nullable = false)
    private SessionExercise sessionExercise;

    @Column(nullable = false)
    private Integer setNumber;

    @Column(nullable = false)
    private BigDecimal weight = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer reps;

    public UUID getId() {
        return id;
    }

    public SessionExercise getSessionExercise() {
        return sessionExercise;
    }

    public void setSessionExercise(SessionExercise sessionExercise) {
        this.sessionExercise = sessionExercise;
    }

    public Integer getSetNumber() {
        return setNumber;
    }

    public void setSetNumber(Integer setNumber) {
        this.setNumber = setNumber;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }
}
