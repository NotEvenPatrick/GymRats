package de.patrickoeder.gymrats.session;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import de.patrickoeder.gymrats.user.User;
import de.patrickoeder.gymrats.user.UserRepository;
import de.patrickoeder.gymrats.exercise.ExerciseRepository;
import de.patrickoeder.gymrats.session.dto.SessionExercisePreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionExerciseRequest;
import de.patrickoeder.gymrats.session.dto.SessionExerciseResponse;
import de.patrickoeder.gymrats.session.dto.SessionPreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionRequest;
import de.patrickoeder.gymrats.session.dto.SessionResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetPreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetRequest;
import de.patrickoeder.gymrats.session.dto.SessionSetResponse;
import de.patrickoeder.gymrats.workout.Workout;
import de.patrickoeder.gymrats.workout.WorkoutExercise;
import de.patrickoeder.gymrats.workout.WorkoutRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, WorkoutRepository workoutRepository,
            ExerciseRepository exerciseRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public SessionPreviewResponse prepareSessionPreviewResponse(UUID workoutId, UUID userId) {
        Workout workout = workoutRepository.findByIdAndOwner_Id(workoutId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

        return toPreviewResponse(workout);
    }

    @Transactional
    public SessionResponse createSession(SessionRequest request, UUID userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Session session = new Session();
        session.setOwner(owner);
        session.setSourceWorkoutId(request.getSourceWorkoutId());
        session.setWorkoutName(request.getWorkoutName());
        session.setStartedAt(request.getStartedAt());
        session.setEndedAt(Instant.now());
        session.setStatus(request.getStatus());
        for (SessionExerciseRequest exerciseRequest : request.getSessionExercises()) {
            session.addSessionExercise(toEntity(exerciseRequest));
        }

        Session savedSession = sessionRepository.save(session);
        return toResponse(savedSession);
    }

    // private void validateSessionRequest(SessionRequest request, UUID userId) {
    //     workoutRepository.findByIdAndOwner_Id(request.getSourceWorkoutId(), userId)
    //             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));

    //     for (SessionExerciseRequest exercises : request.getSessionExercises()) {
    //         exerciseRepository.findById(exercises.getSourceExerciseId())
    //                 .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));
    //     }
    // }

    private SessionPreviewResponse toPreviewResponse(Workout workout) {
        final SessionPreviewResponse response = new SessionPreviewResponse();
        response.setSourceWorkoutId(workout.getId());
        response.setWorkoutName(workout.getName());
        response.setStartedAt(Instant.now());
        response.setSessionExercises(
                workout.getWorkoutExercises().stream()
                        .sorted(Comparator.comparing(WorkoutExercise::getPosition))
                        .map(this::toExercisePreviewResponse)
                        .toList());
        return response;
    }

    private SessionExercisePreviewResponse toExercisePreviewResponse(WorkoutExercise workoutExercise) {
        final SessionExercisePreviewResponse response = new SessionExercisePreviewResponse();
        response.setSourceExerciseId(workoutExercise.getExercise().getId());
        response.setExerciseName(workoutExercise.getExercise().getName());
        response.setMuscleGroup(workoutExercise.getExercise().getMuscleGroup());
        response.setPosition(workoutExercise.getPosition());
        response.setPlannedSets(workoutExercise.getPlannedSets());
        response.setMinReps(workoutExercise.getMinReps());
        response.setMaxReps(workoutExercise.getMaxReps());
        response.setStatus(SessionExerciseStatus.NOT_STARTED);

        ArrayList<SessionSetPreviewResponse> sets = new ArrayList<>();
        for (int i = 0; i < workoutExercise.getPlannedSets(); i++) {
            SessionSetPreviewResponse set = new SessionSetPreviewResponse();
            set.setSetNumber(i + 1);
            sets.add(set);
        }
        response.setSets(sets);
        return response;
    }

    private SessionResponse toResponse(Session session) {
        final SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setSourceWorkoutId(session.getSourceWorkoutId());
        response.setWorkoutName(session.getWorkoutName());
        response.setStartedAt(session.getStartedAt());
        response.setEndedAt(session.getEndedAt());
        response.setStatus(session.getStatus());
        response.setSessionExercises(
                session.getSessionExercises().stream()
                        .sorted(Comparator.comparing(SessionExercise::getPosition))
                        .map(this::toExerciseResponse)
                        .toList());
        return response;

    }

    private SessionExerciseResponse toExerciseResponse(SessionExercise sessionExercise) {
        final SessionExerciseResponse response = new SessionExerciseResponse();
        response.setId(sessionExercise.getId());
        response.setSourceExerciseId(sessionExercise.getSourceExerciseId());
        response.setExerciseName(sessionExercise.getExerciseName());
        response.setMuscleGroup(sessionExercise.getMuscleGroup());
        response.setPosition(sessionExercise.getPosition());
        response.setPlannedSets(sessionExercise.getPlannedSets());
        response.setMinReps(sessionExercise.getMinReps());
        response.setMaxReps(sessionExercise.getMaxReps());
        response.setStatus(sessionExercise.getStatus());
        response.setSets(
                sessionExercise.getSets().stream()
                        .sorted(Comparator.comparing(SessionSet::getSetNumber))
                        .map(this::toSetResponse)
                        .toList());
        return response;
    }

    private SessionSetResponse toSetResponse(SessionSet sessionSet) {
        final SessionSetResponse response = new SessionSetResponse();
        response.setId(sessionSet.getId());
        response.setSetNumber(sessionSet.getSetNumber());
        response.setReps(sessionSet.getReps());
        response.setWeight(sessionSet.getWeight());
        response.setCompleted(sessionSet.isCompleted());
        return response;
    }

    private SessionExercise toEntity(SessionExerciseRequest request) {
        final SessionExercise sessionExercise = new SessionExercise();
        sessionExercise.setSourceExerciseId(request.getSourceExerciseId());
        sessionExercise.setExerciseName(request.getExerciseName());
        sessionExercise.setMuscleGroup(request.getMuscleGroup());
        sessionExercise.setPosition(request.getPosition());
        sessionExercise.setPlannedSets(request.getPlannedSets());
        sessionExercise.setMinReps(request.getMinReps());
        sessionExercise.setMaxReps(request.getMaxReps());
        sessionExercise.setStatus(request.getStatus());

        for (SessionSetRequest setRequest : request.getSets()) {
            sessionExercise.addSet(toEntity(setRequest));
        }
        return sessionExercise;
    }

    private SessionSet toEntity(SessionSetRequest request) {
        final SessionSet sessionSet = new SessionSet();
        sessionSet.setSetNumber(request.getSetNumber());
        sessionSet.setReps(request.getReps());
        sessionSet.setWeight(request.getWeight());
        sessionSet.setCompleted(request.isCompleted());
        return sessionSet;
    }
}
