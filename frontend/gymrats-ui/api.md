# REST API reference

The backend exposes a JSON REST API. The examples below use the local development address:

```text
http://localhost:8080
```

For local frontend development, the Angular dev server proxies `/api/**` to this backend, so the frontend uses relative `/api/...` URLs.

## Authentication

Registration and login are public. All other API endpoints require a valid JWT access token:

```http
Authorization: Bearer <access-token>
```

The login response contains the token. It expires after one hour.

## Endpoints

### Accounts and authentication

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/users` | Public | Register a user account. |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT. |
| `GET` | `/api/users/me` | Required | Return the authenticated user's profile. |

**Registration request**

```json
{
  "firstName": "Alex",
  "lastName": "Example",
  "email": "alex@example.com",
  "password": "a-secure-password"
}
```

The password must contain 8–72 characters. The backend normalises email addresses by trimming whitespace and converting them to lowercase. Passwords are stored as BCrypt hashes.

**Login request**

```json
{
  "email": "alex@example.com",
  "password": "a-secure-password"
}
```

The login response contains `userId`, `firstName`, `lastName`, `email`, and `token`.

### Exercises

All exercise endpoints require authentication. The exercise catalogue is shared by authenticated users; it is not scoped to the current user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/exercises` | List all exercises. |
| `GET` | `/api/exercises/{id}` | Get one exercise. |
| `POST` | `/api/exercises` | Create an exercise. |
| `PUT` | `/api/exercises/{id}` | Update an exercise. |
| `DELETE` | `/api/exercises/{id}` | Delete an exercise. |

Exercise payloads contain `name`, `muscleGroup`, and optional `description`. `muscleGroup` is one of `CHEST`, `BACK`, `SHOULDERS`, `BICEPS`, `TRICEPS`, `LEGS`, `ABS`, `CALVES`, `GLUTES`, or `OTHER`.

An exercise that is referenced by a workout cannot be deleted; the API returns a conflict response.

### Workouts

Workout endpoints require authentication. The API only returns or modifies workouts owned by the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/workouts` | List the current user's workouts. |
| `GET` | `/api/workouts/{id}` | Get one of the current user's workouts. |
| `POST` | `/api/workouts` | Create a workout. |
| `PUT` | `/api/workouts/{id}` | Replace a workout's details and exercise list. |
| `DELETE` | `/api/workouts/{id}` | Delete a workout. |

**Workout request**

```json
{
  "name": "Push Day",
  "description": "Chest, shoulders and triceps",
  "exercises": [
    {
      "exerciseId": "00000000-0000-0000-0000-000000000001",
      "position": 1,
      "plannedSets": 3,
      "minReps": 8,
      "maxReps": 12
    }
  ]
}
```

Each exercise entry references an exercise in the shared catalogue. Positions must be unique within a workout. The repetition range must be valid (`minReps` must not exceed `maxReps`).

### Sessions

Session endpoints require authentication. A session can only be prepared from a workout owned by the authenticated user.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/sessions/preview/{workoutId}` | Build a session preview from a workout. |
| `POST` | `/api/sessions` | Save a completed training session. |
| `GET` | `/api/sessions` | List the current user's sessions, newest first. |
| `GET` | `/api/sessions/{sessionId}` | Get the details of one of the current user's sessions. |

**Session request**

```json
{
  "sourceWorkoutId": "00000000-0000-0000-0000-000000000010",
  "startedAt": "2026-10-30T12:00:00Z",
  "sessionExercises": [
    {
      "sourceExerciseId": "00000000-0000-0000-0000-000000000001",
      "position": 1,
      "sets": [
        {
          "setNumber": 1,
          "weight": 60.0,
          "reps": 10
        },
        {
          "setNumber": 2,
          "weight": 60.0,
          "reps": 9
        }
      ]
    }
  ]
}
```

The request is validated against the source workout. Exercise IDs must match the exercises at the submitted positions. Set numbers must be unique and contiguous from `1`, and the number of submitted sets cannot exceed the planned number of sets for that exercise. At least one set must be saved. Weight must be zero or greater; repetitions and set numbers must be positive.

The backend sets `endedAt` when the session is saved. The session history stores a snapshot of the workout and exercise details. A session record is created only when the user finishes and saves the session; discarding an in-progress session in the frontend does not call this endpoint and therefore does not create a history entry. The data model has no session status field: the previous two-status approach was removed during refactoring because it could produce inconsistent states during saving. A persisted record is therefore the single indicator that a training session was finished and saved.

## Error responses

The backend uses Spring's `ProblemDetail` response format for API errors. Validation errors use HTTP `400` and may include an `errors` object containing field-level messages.

Common status codes:

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Invalid request data or business-rule validation failure. |
| `401 Unauthorized` | Missing or invalid JWT. |
| `404 Not Found` | Resource does not exist or is not accessible to the current user. |
| `409 Conflict` | Data-integrity conflict, such as attempting to delete an exercise that is still referenced by a workout. |
