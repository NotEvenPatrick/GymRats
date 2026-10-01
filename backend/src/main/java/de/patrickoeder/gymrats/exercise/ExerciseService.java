package de.patrickoeder.gymrats.exercise;

import de.patrickoeder.gymrats.exercise.dto.ExerciseCreateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseUpdateRequest;
import de.patrickoeder.gymrats.exercise.dto.ExerciseResponse;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ExerciseService {

	private final ExerciseRepository exerciseRepository;

	public ExerciseService(ExerciseRepository exerciseRepository) {
		this.exerciseRepository = exerciseRepository;
	}

	public ExerciseResponse create(ExerciseCreateRequest request) {
		Exercise exercise = new Exercise();
		exercise.setName(request.getName());
		exercise.setMuscleGroup(request.getMuscleGroup());
		exercise.setDescription(request.getDescription());
		return toResponse(exerciseRepository.save(exercise));
	}

	public List<ExerciseResponse> getAll() {
        return exerciseRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
	}

	public ExerciseResponse getById(UUID id) {
		Exercise exercise = exerciseRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
		return toResponse(exercise);
	}

	public ExerciseResponse update(UUID id, ExerciseUpdateRequest request) {
		Exercise exercise = findById(id);
		exercise.setName(request.getName());
		exercise.setMuscleGroup(request.getMuscleGroup());
		exercise.setDescription(request.getDescription());
		return toResponse(exerciseRepository.save(exercise));
	}

	public void delete(UUID id) {
		Exercise exercise = findById(id);
		exerciseRepository.delete(exercise);
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
