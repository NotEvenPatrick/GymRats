package de.patrickoeder.gymrats.session;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.time.Duration;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import de.patrickoeder.gymrats.user.User;
import de.patrickoeder.gymrats.user.UserRepository;
import de.patrickoeder.gymrats.session.dto.SessionExercisePreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionExerciseRequest;
import de.patrickoeder.gymrats.session.dto.SessionExerciseResponse;
import de.patrickoeder.gymrats.session.dto.SessionPreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionRequest;
import de.patrickoeder.gymrats.session.dto.SessionResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetPreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetRequest;
import de.patrickoeder.gymrats.session.dto.SessionSetResponse;
import de.patrickoeder.gymrats.session.dto.SessionSummaryResponse;
import de.patrickoeder.gymrats.workout.Workout;
import de.patrickoeder.gymrats.workout.WorkoutExercise;
import de.patrickoeder.gymrats.workout.WorkoutRepository;
import de.patrickoeder.gymrats.exercise.Exercise;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private static final Duration CLOCK_TOLERANCE = Duration.ofMinutes(1);

    private final SessionRepository sessionRepository;
    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    public SessionService(SessionRepository sessionRepository, WorkoutRepository workoutRepository,
            UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.workoutRepository = workoutRepository;
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
        Workout workout = getValidatedWorkout(request, userId);

        Instant endedAt = Instant.now();
        if (request.getStartedAt().isAfter(endedAt.plus(CLOCK_TOLERANCE))) {
            throw badRequest("startedAt darf nicht in der Zukunft liegen.");
        }

        Map<Integer, SessionExerciseRequest> requestsByPosition = indexByPosition(request);
        validateAgainstWorkout(workout, requestsByPosition);

        Session session = new Session();
        session.setOwner(owner);
        session.setSourceWorkoutId(workout.getId());
        session.setWorkoutName(workout.getName());
        session.setStartedAt(request.getStartedAt());
        session.setEndedAt(endedAt);

        int totalSets = 0;
        for (WorkoutExercise workoutExercise : workout.getWorkoutExercises()) {
            SessionExerciseRequest exerciseRequest = requestsByPosition.get(workoutExercise.getPosition());
            List<SessionSetRequest> sets = exerciseRequest == null ? List.of() : exerciseRequest.getSets();
            validateSets(workoutExercise, sets);
            totalSets += sets.size();
            session.addSessionExercise(toEntity(workoutExercise, sets));
        }
        if (totalSets == 0) {
            throw badRequest("Mindestens ein Satz muss ausgefüllt sein.");
        }

        Session savedSession = sessionRepository.save(session);
        return toResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public List<SessionSummaryResponse> getSessionHistory(UUID userId) {
        List<Session> sessions = sessionRepository.findAllByOwner_IdOrderByStartedAtDesc(userId);
        return sessions.stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID sessionId, UUID userId) {
        Session session = sessionRepository.findByIdAndOwner_Id(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
        return toResponse(session);
    }

    private Workout getValidatedWorkout(SessionRequest request, UUID userId) {
        final Workout workout = workoutRepository.findByIdAndOwner_Id(request.getSourceWorkoutId(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workout not found"));
        return workout;
    }

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
        ArrayList<SessionSetPreviewResponse> sets = new ArrayList<>();
        for (int i = 0; i < workoutExercise.getPlannedSets(); i++) {
            SessionSetPreviewResponse set = new SessionSetPreviewResponse();
            set.setSetNumber(i + 1);
            set.setWeight(BigDecimal.ZERO);
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
        return response;
    }

    private Map<Integer, SessionExerciseRequest> indexByPosition(SessionRequest request) {
        Map<Integer, SessionExerciseRequest> byPosition = new HashMap<>();
        for (SessionExerciseRequest exerciseRequest : request.getSessionExercises()) {
            if (byPosition.put(exerciseRequest.getPosition(), exerciseRequest) != null) {
                throw badRequest("Position " + exerciseRequest.getPosition() + " ist doppelt vorhanden.");
            }
        }
        return byPosition;
    }

    private void validateAgainstWorkout(Workout workout, Map<Integer, SessionExerciseRequest> requestsByPosition) {
        Map<Integer, WorkoutExercise> workoutByPosition = new HashMap<>();
        for (WorkoutExercise workoutExercise : workout.getWorkoutExercises()) {
            workoutByPosition.put(workoutExercise.getPosition(), workoutExercise);
        }
        requestsByPosition.forEach((position, exerciseRequest) -> {
            WorkoutExercise workoutExercise = workoutByPosition.get(position);
            if (workoutExercise == null
                    || !workoutExercise.getExercise().getId().equals(exerciseRequest.getSourceExerciseId())) {
                throw badRequest("Übung an Position " + position + " gehört nicht zum Workout.");
            }
        });
    }

    private void validateSets(WorkoutExercise workoutExercise, List<SessionSetRequest> sets) {
        if (sets.size() > workoutExercise.getPlannedSets()) {
            throw badRequest("Zu viele Sätze für Übung an Position " + workoutExercise.getPosition() + ".");
        }
        List<Integer> setNumbers = sets.stream().map(SessionSetRequest::getSetNumber).sorted().toList();
        for (int i = 0; i < setNumbers.size(); i++) {
            if (setNumbers.get(i) != i + 1) {
                throw badRequest("Satznummern müssen eindeutig sein und bei 1 beginnen (Position "
                        + workoutExercise.getPosition() + ").");
            }
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private SessionExercise toEntity(WorkoutExercise workoutExercise, List<SessionSetRequest> sets) {
        final Exercise exercise = workoutExercise.getExercise();
        final SessionExercise sessionExercise = new SessionExercise();
        sessionExercise.setSourceExerciseId(exercise.getId());
        sessionExercise.setExerciseName(exercise.getName());
        sessionExercise.setMuscleGroup(exercise.getMuscleGroup());
        sessionExercise.setPosition(workoutExercise.getPosition());
        sessionExercise.setPlannedSets(workoutExercise.getPlannedSets());
        sessionExercise.setMinReps(workoutExercise.getMinReps());
        sessionExercise.setMaxReps(workoutExercise.getMaxReps());
        for (SessionSetRequest setRequest : sets) {
            sessionExercise.addSet(toEntity(setRequest));
        }
        return sessionExercise;
    }

    private SessionSet toEntity(SessionSetRequest request) {
        final SessionSet sessionSet = new SessionSet();
        sessionSet.setSetNumber(request.getSetNumber());
        sessionSet.setReps(request.getReps());
        sessionSet.setWeight(request.getWeight());
        return sessionSet;
    }

    private SessionSummaryResponse toSummaryResponse(Session session) {
        final SessionSummaryResponse response = new SessionSummaryResponse();
        response.setId(session.getId());
        response.setWorkoutName(session.getWorkoutName());
        response.setStartedAt(session.getStartedAt());
        response.setEndedAt(session.getEndedAt());
        response.setExerciseCount(session.getSessionExercises().size());
        return response;
    }
}
