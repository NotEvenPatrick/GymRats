package de.patrickoeder.gymrats.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class JwtPropertiesTest {

    @Test
    void acceptsSecretWithAtLeast32Bytes() {
        assertThat(new JwtProperties("a".repeat(32)).secret()).hasSize(32);
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtProperties("a".repeat(31)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsMissingSecret() {
        assertThatThrownBy(() -> new JwtProperties(null))
                .isInstanceOf(IllegalStateException.class);
    }
}
