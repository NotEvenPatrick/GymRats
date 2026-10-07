package de.patrickoeder.gymrats.user.dto;

import java.util.UUID;

public class LoginResponse {
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String token;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID id) {
        this.userId = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
