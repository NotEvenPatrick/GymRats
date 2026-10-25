package de.patrickoeder.gymrats.security;

import java.nio.charset.StandardCharsets;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gymrats.jwt")
public record JwtProperties(String secret) {

    // HS256 benötigt mindestens 256 Bit (32 Byte)
    private static final int MIN_SECRET_BYTES = 32;

    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "gymrats.jwt.secret (Umgebungsvariable GYMRATS_JWT_SECRET) muss mindestens "
                            + MIN_SECRET_BYTES + " Byte lang sein.");
        }
    }
}
