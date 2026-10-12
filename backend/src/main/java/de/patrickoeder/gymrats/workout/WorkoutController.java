package de.patrickoeder.gymrats.workout;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import de.patrickoeder.gymrats.workout.dto.WorkoutRequest;
import de.patrickoeder.gymrats.workout.dto.WorkoutResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {
    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(@Valid @RequestBody WorkoutRequest request, @AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        WorkoutResponse response = workoutService.createWorkout(request, ownerId);
        URI location = URI.create("/api/workouts/" + response.getId());
    
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<WorkoutResponse> getAllWorkouts(@AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return workoutService.getAllByOwner(ownerId);
    }

    @GetMapping("/{id}")
    public WorkoutResponse getWorkoutById( @PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return workoutService.getByIdAndOwner(id, ownerId);
    }
    
    @PutMapping("/{id}")
    public WorkoutResponse updateWorkout(
        @PathVariable UUID id, @Valid @RequestBody WorkoutRequest request, @AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return workoutService.updateWorkout(id, ownerId, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
        @PathVariable UUID id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        workoutService.deleteWorkout(id, ownerId);
        return ResponseEntity.noContent().build();
    }

}
