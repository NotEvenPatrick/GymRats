package de.patrickoeder.gymrats.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class ApiErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    private String token;

    @BeforeEach
    void registerAndLogin() throws Exception {
        String email = "it-" + System.nanoTime() + "@example.com";
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"firstName":"It","lastName":"Test","email":"%s","password":"Passw0rd!"}
                        """.formatted(email)))
                .andExpect(status().isCreated());

        String body = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"%s","password":"Passw0rd!"}
                        """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        token = JsonPath.read(body, "$.token");
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/workouts")).andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateRegistrationReturns409AsProblemDetail() throws Exception {
        String payload = """
                {"firstName":"A","lastName":"B","email":"dup@example.com","password":"Passw0rd!"}
                """;
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(payload));

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.detail").isNotEmpty());
    }

    @Test
    void invalidRequestReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/workouts")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"\",\"exercises\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").isNotEmpty())
                .andExpect(jsonPath("$.errors.exercises").isNotEmpty());
    }

    @Test
    void registrationRejectsInvalidEmailAndShortPassword() throws Exception {
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"firstName":"A","lastName":"B","email":"kein-email","password":"kurz"}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").isNotEmpty())
                .andExpect(jsonPath("$.errors.password").isNotEmpty());
    }

    @Test
    void emailIsCaseInsensitiveForRegistrationAndLogin() throws Exception {
        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"firstName":"A","lastName":"B","email":"Case@Example.com","password":"Passw0rd!"}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("case@example.com"));

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"firstName":"A","lastName":"B","email":"CASE@example.com","password":"Passw0rd!"}
                        """))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email":"CASE@EXAMPLE.COM","password":"Passw0rd!"}
                        """))
                .andExpect(status().isOk());
    }

    @Test
    void workoutTrimsNameRejectsDuplicatePositionsAndReturnsExercisesSorted() throws Exception {
        String exercises = mockMvc.perform(get("/api/exercises").header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getContentAsString();
        String first = JsonPath.read(exercises, "$[0].id");
        String second = JsonPath.read(exercises, "$[1].id");

        String duplicate = """
                {"name":"W","exercises":[
                  {"exerciseId":"%s","position":1,"plannedSets":3,"minReps":6,"maxReps":10},
                  {"exerciseId":"%s","position":1,"plannedSets":3,"minReps":6,"maxReps":10}]}
                """.formatted(first, second);
        mockMvc.perform(post("/api/workouts").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(duplicate))
                .andExpect(status().isBadRequest());

        String unsorted = """
                {"name":"  Push  ","exercises":[
                  {"exerciseId":"%s","position":2,"plannedSets":3,"minReps":6,"maxReps":10},
                  {"exerciseId":"%s","position":1,"plannedSets":3,"minReps":6,"maxReps":10}]}
                """.formatted(second, first);
        mockMvc.perform(post("/api/workouts").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(unsorted))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Push"))
                .andExpect(jsonPath("$.exercises[0].position").value(1))
                .andExpect(jsonPath("$.exercises[0].exerciseId").value(first))
                .andExpect(jsonPath("$.exercises[1].position").value(2));
    }

    @Test
    void unknownResourceReturns404AsProblemDetail() throws Exception {
        mockMvc.perform(get("/api/workouts/00000000-0000-0000-0000-000000000000")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void deletingExerciseUsedByWorkoutReturns409() throws Exception {
        String exercises = mockMvc.perform(get("/api/exercises").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String exerciseId = JsonPath.read(exercises, "$[0].id");

        mockMvc.perform(post("/api/workouts")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name":"W","exercises":[{"exerciseId":"%s","position":1,"plannedSets":3,"minReps":6,"maxReps":10}]}
                        """.formatted(exerciseId)))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/exercises/" + exerciseId).header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Die Übung wird noch in Workouts verwendet."));
    }
}
