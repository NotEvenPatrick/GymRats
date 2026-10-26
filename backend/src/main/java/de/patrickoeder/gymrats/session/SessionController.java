package de.patrickoeder.gymrats.session;

import org.springframework.web.bind.annotation.RestController;

import de.patrickoeder.gymrats.security.CurrentUser;
import de.patrickoeder.gymrats.session.dto.SessionPreviewResponse;
import de.patrickoeder.gymrats.session.dto.SessionRequest;
import de.patrickoeder.gymrats.session.dto.SessionResponse;
import de.patrickoeder.gymrats.session.dto.SessionSummaryResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;

import java.net.URI;
import java.util.UUID;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/preview/{workoutId}")
    public SessionPreviewResponse prepareSessionPreviewResponse(@PathVariable UUID workoutId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = CurrentUser.id(jwt);
        return sessionService.prepareSessionPreviewResponse(workoutId, userId);
    }

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody SessionRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = CurrentUser.id(jwt);
        SessionResponse response = sessionService.createSession(request, userId);
        URI location = URI.create("/api/sessions/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    public List<SessionSummaryResponse> getSessionHistory(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = CurrentUser.id(jwt);
        return sessionService.getSessionHistory(userId);
    }

    @GetMapping("/{sessionId}")
    public SessionResponse getSession(@PathVariable UUID sessionId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = CurrentUser.id(jwt);
        return sessionService.getSession(sessionId, userId);
    }
    
}
