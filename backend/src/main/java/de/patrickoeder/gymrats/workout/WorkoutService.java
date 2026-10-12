package de.patrickoeder.gymrats.workout;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import de.patrickoeder.gymrats.exercise.Exercise;
import de.patrickoeder.gymrats.exercise.ExerciseRepository;
import de.patrickoeder.gymrats.user.User;
import de.patrickoeder.gymrats.user.UserRepository;
import de.patrickoeder.gymrats.workout.dto.WorkoutExerciseRequest;
import de.patrickoeder.gymrats.workout.dto.WorkoutExerciseResponse;
import de.patrickoeder.gymrats.workout.dto.WorkoutRequest;
import de.patrickoeder.gymrats.workout.dto.WorkoutResponse;

@Service 
public class WorkoutService {
    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutService(WorkoutRepository workoutRepository, UserRepository userRepository, ExerciseRepository exerciseRepository) {
        this.workoutRepository = workoutRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional 
    public WorkoutResponse createWorkout(WorkoutRequest request, UUID ownerId) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new RuntimeException("User not found"));

        Workout workout = new Workout();
        workout.setName(request.getName());
        workout.setDescription(request.getDescription());
        workout.setOwner(owner);

        for (WorkoutExerciseRequest exerciseRequest : request.getExercises()) {
            //Find exercise by its id
            Exercise exercise = exerciseRepository.findById(exerciseRequest.getExerciseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
            
            //Map workoutExerciseRequest from the request to WorkoutExercise entity
            WorkoutExercise workoutExercise = new WorkoutExercise();
            workoutExercise.setExercise(exercise);
            workoutExercise.setPosition(exerciseRequest.getPosition());
            workoutExercise.setPlannedSets(exerciseRequest.getPlannedSets());
            workoutExercise.setMinReps(exerciseRequest.getMinReps());
            workoutExercise.setMaxReps(exerciseRequest.getMaxReps());

            //Add the mapped workoutExercise to the workout
            workout.addWorkoutExercise(workoutExercise);
        }
            Workout savedWorkout = workoutRepository.save(workout);
            return toResponse(savedWorkout);
    }

    @Transactional
    public WorkoutResponse updateWorkout(UUID id, UUID ownerId, WorkoutRequest request) {
        Workout workout = workoutRepository.findByIdAndOwner_Id(id, ownerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
        

        workout.setName(request.getName().trim());
        workout.setDescription(request.getDescription());

        for (WorkoutExercise existing : new ArrayList<>(workout.getWorkoutExercises())) {
            workout.removeWorkoutExercise(existing);
            
        }
        for (WorkoutExerciseRequest exerciseRequest : request.getExercises()) {
            Exercise exercise = exerciseRepository.findById(exerciseRequest.getExerciseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

            WorkoutExercise workoutExercise = new WorkoutExercise();
            workoutExercise.setExercise(exercise);
            workoutExercise.setPosition(exerciseRequest.getPosition());
            workoutExercise.setPlannedSets(exerciseRequest.getPlannedSets());
            workoutExercise.setMinReps(exerciseRequest.getMinReps());
            workoutExercise.setMaxReps(exerciseRequest.getMaxReps());
            workout.addWorkoutExercise(workoutExercise);
        
        }
        return toResponse(workout);
    }

    @Transactional
    public void deleteWorkout(UUID id, UUID ownerId) {
        Workout workout = workoutRepository.findByIdAndOwner_Id(id, ownerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
        workoutRepository.delete(workout);
    }

        

    @Transactional(readOnly = true)
    public WorkoutResponse getByIdAndOwner(UUID id, UUID ownerId) {
        Workout workout = workoutRepository.findByIdAndOwner_Id(id, ownerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
        return toResponse(workout);
    }

    @Transactional(readOnly = true)
    public List<WorkoutResponse> getAllByOwner(UUID ownerId) {
        List<Workout> workouts = workoutRepository.findAllByOwnerId(ownerId);
        List<WorkoutResponse> responses = new ArrayList<>();
        for (Workout workout : workouts) {
            responses.add(toResponse(workout));
        }
        return responses;
    }

    private WorkoutResponse toResponse(Workout workout) {
        WorkoutResponse response = new WorkoutResponse();
        response.setId(workout.getId());
        response.setName(workout.getName());
        response.setDescription(workout.getDescription());
        response.setOwnerId(workout.getOwner().getId());

        List<WorkoutExerciseResponse> exercises = new ArrayList<>();
        for (WorkoutExercise workoutExercise : workout.getWorkoutExercises()) {
            WorkoutExerciseResponse exerciseResponse = new WorkoutExerciseResponse();
            exerciseResponse.setId(workoutExercise.getId());
            exerciseResponse.setExerciseId(workoutExercise.getExercise().getId());
            exerciseResponse.setPosition(workoutExercise.getPosition());
            exerciseResponse.setPlannedSets(workoutExercise.getPlannedSets());
            exerciseResponse.setMinReps(workoutExercise.getMinReps());
            exerciseResponse.setMaxReps(workoutExercise.getMaxReps());
            exerciseResponse.setExerciseName(workoutExercise.getExercise().getName());
            exerciseResponse.setMuscleGroup(workoutExercise.getExercise().getMuscleGroup());
            exercises.add(exerciseResponse);
        }
        response.setExercises(exercises);

        return response;
    }
}
    

