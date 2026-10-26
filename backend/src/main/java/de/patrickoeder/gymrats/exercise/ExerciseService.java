package de.patrickoeder.gymrats.exercise;

import de.patrickoeder.gymrats.exercise.dto.ExerciseCreateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseUpdateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseResponse;

import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public ExerciseResponse create(ExerciseCreateRequest request) {
        Exercise exercise = new Exercise();
        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setDescription(request.getDescription());
        return toResponse(exerciseRepository.save(exercise));
    }

    @Transactional(readOnly = true)
    public List<ExerciseResponse> getAll() {
        return exerciseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExerciseResponse getById(UUID id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ExerciseResponse update(UUID id, ExerciseUpdateRequest request) {
        Exercise exercise = findById(id);
        exercise.setName(request.getName());
        exercise.setMuscleGroup(request.getMuscleGroup());
        exercise.setDescription(request.getDescription());
        return toResponse(exerciseRepository.save(exercise));
    }

    // Bewusst ohne @Transactional: Die Constraint-Verletzung soll hier im
    // Repository-Aufruf auftreten und nicht erst beim Commit außerhalb der Methode.
    public void delete(UUID id) {
        Exercise exercise = findById(id);
        try {
            exerciseRepository.delete(exercise);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Die Übung wird noch in Workouts verwendet.");
        }
    }

    private ExerciseResponse toResponse(Exercise exercise) {
        ExerciseResponse response = new ExerciseResponse();
        response.setId(exercise.getId());
        response.setName(exercise.getName());
        response.setMuscleGroup(exercise.getMuscleGroup());
        response.setDescription(exercise.getDescription());
        return response;
    }

    private Exercise findById(UUID id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
    }
}
