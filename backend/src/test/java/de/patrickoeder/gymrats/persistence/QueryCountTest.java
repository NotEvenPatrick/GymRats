package de.patrickoeder.gymrats.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import de.patrickoeder.gymrats.exercise.Exercise;
import de.patrickoeder.gymrats.exercise.ExerciseRepository;
import de.patrickoeder.gymrats.session.SessionService;
import de.patrickoeder.gymrats.session.dto.SessionExerciseRequest;
import de.patrickoeder.gymrats.session.dto.SessionRequest;
import de.patrickoeder.gymrats.session.dto.SessionResponse;
import de.patrickoeder.gymrats.session.dto.SessionSetRequest;
import de.patrickoeder.gymrats.user.UserService;
import de.patrickoeder.gymrats.user.dto.UserCreateRequest;
import de.patrickoeder.gymrats.user.dto.UserResponse;
import de.patrickoeder.gymrats.workout.WorkoutService;
import de.patrickoeder.gymrats.workout.dto.WorkoutExerciseRequest;
import de.patrickoeder.gymrats.workout.dto.WorkoutRequest;
import de.patrickoeder.gymrats.workout.dto.WorkoutResponse;
import jakarta.persistence.EntityManagerFactory;

/**
 * Stellt sicher, dass Listen-Endpunkte nicht pro Zeile zusätzliche Abfragen auslösen.
 * Die Obergrenzen sind unabhängig von der Datenmenge: Es werden jeweils 5 Workouts bzw. Sessions
 * mit je 3 Übungen angelegt.
 */
@SpringBootTest
class QueryCountTest {

    private static final int ENTITIES = 5;

    @Autowired
    private UserService userService;
    @Autowired
    private WorkoutService workoutService;
    @Autowired
    private SessionService sessionService;
    @Autowired
    private ExerciseRepository exerciseRepository;
    @Autowired
    private EntityManagerFactory entityManagerFactory;

    private UUID userId;
    private Statistics statistics;

    @BeforeEach
    void createData() {
        statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();

        UserCreateRequest userRequest = new UserCreateRequest();
        userRequest.setFirstName("Query");
        userRequest.setLastName("Count");
        userRequest.setEmail("query-" + System.nanoTime() + "@example.com");
        userRequest.setPassword("Passw0rd!");
        UserResponse user = userService.createUser(userRequest);
        userId = user.getId();

        List<Exercise> exercises = exerciseRepository.findAll().subList(0, 3);
        for (int i = 0; i < ENTITIES; i++) {
            WorkoutResponse workout = workoutService.createWorkout(workoutRequest("W" + i, exercises), userId);
            sessionService.createSession(sessionRequest(workout), userId);
        }
    }

    @Test
    void workoutListUsesConstantNumberOfQueries() {
        statistics.clear();

        List<WorkoutResponse> workouts = workoutService.getAllByOwner(userId);

        assertThat(workouts).hasSize(ENTITIES);
        System.out.println("QUERIES workout list: " + statistics.getPrepareStatementCount());
        assertThat(statistics.getPrepareStatementCount()).isLessThanOrEqualTo(3);
    }

    @Test
    void sessionHistoryUsesConstantNumberOfQueries() {
        statistics.clear();

        var history = sessionService.getSessionHistory(userId);

        assertThat(history).hasSize(ENTITIES);
        System.out.println("QUERIES session history: " + statistics.getPrepareStatementCount());
        assertThat(statistics.getPrepareStatementCount()).isLessThanOrEqualTo(2);
    }

    @Test
    void sessionDetailsUseConstantNumberOfQueries() {
        UUID sessionId = sessionService.getSessionHistory(userId).get(0).getId();
        statistics.clear();

        SessionResponse session = sessionService.getSession(sessionId, userId);

        assertThat(session.getSessionExercises()).hasSize(3);
        assertThat(session.getSessionExercises().get(0).getSets()).hasSize(2);
        System.out.println("QUERIES session details: " + statistics.getPrepareStatementCount());
        assertThat(statistics.getPrepareStatementCount()).isLessThanOrEqualTo(3);
    }

    private WorkoutRequest workoutRequest(String name, List<Exercise> exercises) {
        WorkoutRequest request = new WorkoutRequest();
        request.setName(name);
        List<WorkoutExerciseRequest> items = new ArrayList<>();
        for (int i = 0; i < exercises.size(); i++) {
            WorkoutExerciseRequest item = new WorkoutExerciseRequest();
            item.setExerciseId(exercises.get(i).getId());
            item.setPosition(i + 1);
            item.setPlannedSets(3);
            item.setMinReps(6);
            item.setMaxReps(10);
            items.add(item);
        }
        request.setExercises(items);
        return request;
    }

    private SessionRequest sessionRequest(WorkoutResponse workout) {
        SessionRequest request = new SessionRequest();
        request.setSourceWorkoutId(workout.getId());
        request.setStartedAt(Instant.now().minusSeconds(600));
        List<SessionExerciseRequest> items = new ArrayList<>();
        workout.getExercises().forEach(exercise -> {
            SessionExerciseRequest item = new SessionExerciseRequest();
            item.setPosition(exercise.getPosition());
            item.setSourceExerciseId(exercise.getExerciseId());
            List<SessionSetRequest> sets = new ArrayList<>();
            for (int n = 1; n <= 2; n++) {
                SessionSetRequest set = new SessionSetRequest();
                set.setSetNumber(n);
                set.setReps(8);
                set.setWeight(BigDecimal.TEN);
                sets.add(set);
            }
            item.setSets(sets);
            items.add(item);
        });
        request.setSessionExercises(items);
        return request;
    }
}
