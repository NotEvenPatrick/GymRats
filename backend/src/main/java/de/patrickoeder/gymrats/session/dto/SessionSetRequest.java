package de.patrickoeder.gymrats.session.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

/**
 * SessionSetRequest
 */
public class SessionSetRequest {
    @NotNull
    @Min(1)
    private Integer setNumber;

    @NotNull
    @PositiveOrZero
    private BigDecimal weight;

    @NotNull
    @Positive
    private Integer reps;

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
