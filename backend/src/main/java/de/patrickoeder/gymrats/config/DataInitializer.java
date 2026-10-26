package de.patrickoeder.gymrats.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import de.patrickoeder.gymrats.user.Role;
import de.patrickoeder.gymrats.user.User;
import de.patrickoeder.gymrats.user.UserRepository;

@Configuration
@Profile({"dev", "e2e"})
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("patrick@example.com")) {
                User user = new User();
                user.setFirstName("Patrick");
                user.setLastName("Oeder");
                user.setEmail("patrick@example.com");
                user.setPasswordHash(passwordEncoder.encode("TestPassword123!"));
                user.setRole(Role.ATHLETE);
                userRepository.save(user);
            }
        };
    }
}
