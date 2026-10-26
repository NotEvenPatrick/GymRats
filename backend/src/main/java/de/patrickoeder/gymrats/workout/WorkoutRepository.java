package de.patrickoeder.gymrats.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutRepository extends JpaRepository<Workout, UUID>  {
    
    List<Workout> findAllByOwner_Id(UUID ownerId);

    Optional<Workout> findByIdAndOwner_Id(UUID id, UUID ownerId);
}
