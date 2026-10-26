package de.patrickoeder.gymrats.session.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * SessionExerciseRequest
 */
public class SessionExerciseRequest {
    @NotNull
    private UUID sourceExerciseId;

    @NotNull
    @Min(1)
    private Integer position;

    @NotNull
    private List<@Valid SessionSetRequest> sets = new ArrayList<>();

    public UUID getSourceExerciseId() {
        return sourceExerciseId;
    }

    public void setSourceExerciseId(UUID sourceExerciseId) {
        this.sourceExerciseId = sourceExerciseId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public List<SessionSetRequest> getSets() {
        return sets;
    }

    public void setSets(List<SessionSetRequest> sets) {
        this.sets = sets;
    }
}
