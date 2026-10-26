package de.patrickoeder.gymrats.exercise;

import de.patrickoeder.gymrats.exercise.dto.ExerciseCreateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseUpdateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> create(@Valid @RequestBody ExerciseCreateRequest request) {
        ExerciseResponse createdExercise = exerciseService.create(request);
        return ResponseEntity.created(URI.create("/api/exercises/" + createdExercise.getId()))
                .body(createdExercise);
    }

    @GetMapping
    public List<ExerciseResponse> getAll() {
        return exerciseService.getAll();
    }

    @GetMapping("/{id}")
    public ExerciseResponse getById(@PathVariable UUID id) {
        return exerciseService.getById(id);
    }

    @PutMapping("/{id}")
    public ExerciseResponse update(@PathVariable UUID id, @Valid @RequestBody ExerciseUpdateRequest request) {
        return exerciseService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        exerciseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
