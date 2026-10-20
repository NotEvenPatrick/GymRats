package de.patrickoeder.gymrats.session.dto;

import java.math.BigDecimal;

public class SessionSetPreviewResponse {
    private int setNumber;
    private BigDecimal weight = BigDecimal.ZERO;
    private Integer reps;

    public int getSetNumber() {
        return setNumber;
    }

    public void setSetNumber(int setNumber) {
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
