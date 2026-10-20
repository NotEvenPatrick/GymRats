package de.patrickoeder.gymrats.session;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findAllByOwner_IdOrderByStartedAtDesc(UUID ownerId);

    Optional<Session> findByIdAndOwner_Id(UUID sessionId, UUID ownerId);
}
