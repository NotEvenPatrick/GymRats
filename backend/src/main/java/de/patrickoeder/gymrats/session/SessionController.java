package de.patrickoeder.gymrats.session;

import org.springframework.web.bind.annotation.RestController;

import de.patrickoeder.gymrats.session.dto.SessionPreviewResponse;

import org.springframework.web.bind.annotation.GetMapping;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/preview/{workoutId}")
    public SessionPreviewResponse prepareSessionPreviewResponse(@PathVariable("workoutId") UUID workoutId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return sessionService.prepareSessionPreviewResponse(workoutId, userId);
    }
}
