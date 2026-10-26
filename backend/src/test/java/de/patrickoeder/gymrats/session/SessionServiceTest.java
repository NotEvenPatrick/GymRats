package de.patrickoeder.gymrats.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import de.patrickoeder.gymrats.exercise.Exercise;
import de.patrickoeder.gymrats.exercise.MuscleGroup;
import de.patrickoeder.gymrats.session.dto.SessionExerciseRequest;
import de.patrickoeder.gymrats.session.dto.SessionRequest;
import de.patrickoeder.gymrats.session.dto.SessionResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetRequest;
import de.patrickoeder.gymrats.user.User;
import de.patrickoeder.gymrats.user.UserRepository;
import de.patrickoeder.gymrats.workout.Workout;
import de.patrickoeder.gymrats.workout.WorkoutExercise;
import de.patrickoeder.gymrats.workout.WorkoutRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private WorkoutRepository workoutRepository;
    @Mock
    private UserRepository userRepository;

    private SessionService sessionService;

    private final UUID userId = UUID.randomUUID();
    private final UUID workoutId = UUID.randomUUID();
    private final UUID benchId = UUID.randomUUID();
    private final UUID squatId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        sessionService = new SessionService(sessionRepository, workoutRepository, userRepository);

        User owner = new User();
        ReflectionTestUtils.setField(owner, "id", userId);
        Workout workout = new Workout();
        ReflectionTestUtils.setField(workout, "id", workoutId);
        workout.setName("Push");
        workout.setOwner(owner);
        workout.addWorkoutExercise(workoutExercise("Bench Press", benchId, MuscleGroup.CHEST, 1, 3));
        workout.addWorkoutExercise(workoutExercise("Squat", squatId, MuscleGroup.LEGS, 2, 3));

        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
        when(workoutRepository.findByIdAndOwner_Id(workoutId, userId)).thenReturn(Optional.of(workout));
        when(sessionRepository.save(any(Session.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void keepsExercisesWithoutSetsAndTakesPlanValuesFromWorkout() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8)), exercise(2, squatId));

        SessionResponse response = sessionService.createSession(request, userId);

        assertThat(response.getSessionExercises()).hasSize(2);
        assertThat(response.getSessionExercises().get(0).getSets()).hasSize(1);
        assertThat(response.getSessionExercises().get(1).getSets()).isEmpty();
        assertThat(response.getSessionExercises().get(1).getExerciseName()).isEqualTo("Squat");
        assertThat(response.getSessionExercises().get(1).getPlannedSets()).isEqualTo(3);
    }

    @Test
    void addsWorkoutExercisesMissingInRequestWithZeroSets() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8)));

        SessionResponse response = sessionService.createSession(request, userId);

        assertThat(response.getSessionExercises()).hasSize(2);
        assertThat(response.getSessionExercises().get(1).getSets()).isEmpty();
    }

    @Test
    void rejectsSessionWithoutAnySet() {
        SessionRequest request = request(exercise(1, benchId), exercise(2, squatId));

        assertBadRequest(request);
    }

    @Test
    void rejectsExerciseThatIsNotPartOfWorkout() {
        SessionRequest request = request(exercise(1, UUID.randomUUID(), set(1, 8)));

        assertBadRequest(request);
    }

    @Test
    void rejectsDuplicatePositions() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8)), exercise(1, benchId, set(1, 8)));

        assertBadRequest(request);
    }

    @Test
    void rejectsGapsOrDuplicatesInSetNumbers() {
        assertBadRequest(request(exercise(1, benchId, set(2, 8))));
        assertBadRequest(request(exercise(1, benchId, set(1, 8), set(1, 8))));
    }

    @Test
    void rejectsMoreSetsThanPlanned() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8), set(2, 8), set(3, 8), set(4, 8)));

        assertBadRequest(request);
    }

    @Test
    void rejectsStartInTheFuture() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8)));
        request.setStartedAt(Instant.now().plusSeconds(3600));

        assertBadRequest(request);
    }

    @Test
    void capsStartAtEndWhenWithinClockTolerance() {
        SessionRequest request = request(exercise(1, benchId, set(1, 8)));
        request.setStartedAt(Instant.now().plusSeconds(30));

        SessionResponse response = sessionService.createSession(request, userId);

        assertThat(response.getStartedAt()).isEqualTo(response.getEndedAt());
    }

    @Test
    void keepsStartBeforeEndUnchanged() {
        Instant startedAt = Instant.now().minusSeconds(600);
        SessionRequest request = request(exercise(1, benchId, set(1, 8)));
        request.setStartedAt(startedAt);

        SessionResponse response = sessionService.createSession(request, userId);

        assertThat(response.getStartedAt()).isEqualTo(startedAt);
    }

    @Test
    void returnsNotFoundForForeignWorkout() {
        UUID otherUser = UUID.randomUUID();
        when(userRepository.findById(otherUser)).thenReturn(Optional.of(new User()));
        when(workoutRepository.findByIdAndOwner_Id(workoutId, otherUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.createSession(request(exercise(1, benchId, set(1, 8))), otherUser))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        verify(sessionRepository, never()).save(any());
    }

    private void assertBadRequest(SessionRequest request) {
        assertThatThrownBy(() -> sessionService.createSession(request, userId))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(sessionRepository, never()).save(any());
    }

    private WorkoutExercise workoutExercise(String name, UUID exerciseId, MuscleGroup group, int position,
            int plannedSets) {
        Exercise exercise = new Exercise();
        ReflectionTestUtils.setField(exercise, "id", exerciseId);
        exercise.setName(name);
        exercise.setMuscleGroup(group);
        WorkoutExercise workoutExercise = new WorkoutExercise();
        workoutExercise.setExercise(exercise);
        workoutExercise.setPosition(position);
        workoutExercise.setPlannedSets(plannedSets);
        workoutExercise.setMinReps(6);
        workoutExercise.setMaxReps(10);
        return workoutExercise;
    }

    private SessionRequest request(SessionExerciseRequest... exercises) {
        SessionRequest request = new SessionRequest();
        request.setSourceWorkoutId(workoutId);
        request.setStartedAt(Instant.now().minusSeconds(600));
        request.setSessionExercises(List.of(exercises));
        return request;
    }

    private SessionExerciseRequest exercise(int position, UUID exerciseId, SessionSetRequest... sets) {
        SessionExerciseRequest exercise = new SessionExerciseRequest();
        exercise.setPosition(position);
        exercise.setSourceExerciseId(exerciseId);
        exercise.setSets(List.of(sets));
        return exercise;
    }

    private SessionSetRequest set(int number, int reps) {
        SessionSetRequest set = new SessionSetRequest();
        set.setSetNumber(number);
        set.setReps(reps);
        set.setWeight(BigDecimal.TEN);
        return set;
    }
}
