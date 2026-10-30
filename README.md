# GymRats

![GymRats logo](frontend/gymrats-ui/src/app/assets/gymrats_logo_1000.webp)

**Train harder. Track everything.**

GymRats is a full-stack workout planning and training log application. It lets users maintain an exercise library, build structured workouts, record completed training sessions, and review their training history.

The project is built as a portfolio application with an Angular single-page frontend and a Java/Spring Boot REST API.

## Features

### Accounts and authentication

- Register an account and sign in with an email address and password.
- Passwords are stored as BCrypt hashes.
- The API issues signed JWT access tokens; authenticated requests use the `Authorization: Bearer` header.
- Workout plans and training sessions are scoped to the authenticated user.

### Exercise library

- Browse a catalogue of exercises with muscle group and description.
- Create, edit, and delete exercises.
- Exercises used by a workout cannot be deleted.

### Workout planning

- Create, edit, and delete personal workout plans.
- Add exercises and define their order, planned number of sets, and repetition range.
- Reorder exercises with drag and drop.
- Review a workout's exercise list before starting a session.

### Training sessions

- Start a session from one of your workout plans.
- Record weight and repetitions for each planned set.
- Finish and save a session, then review its details in the training history.
- Discard a session without saving it.

A session is persisted only when the user finishes and saves it. Until then, the entered data remains in the frontend. Empty sets are omitted from the saved session, and at least one set must contain both a weight and a repetition count. Discarding a session does not create a history entry.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | Angular 22, TypeScript, RxJS, Angular Material, Angular CDK, SCSS |
| Frontend testing | Vitest, Angular testing utilities, TestCafe for end-to-end tests |
| Backend | Java 25, Spring Boot 4.1, Spring Security, Spring Data JPA, Hibernate |
| Database | H2 |
| API | REST, JSON, JWT bearer authentication |
| Build tools | npm, Maven Wrapper |

## Architecture

The application consists of two independently started services:

- **Frontend:** Angular SPA served locally at `http://localhost:4200` during development.
- **Backend:** Spring Boot REST API served locally at `http://localhost:8080`.

During local development, the Angular dev server proxies `/api/**` requests to the backend. The backend uses Spring MVC controllers, service classes, Spring Data repositories, and JPA entities. The default H2 database is file-based.

See [Architecture](docs/architecture.md) for the component overview and data model, [API Reference](docs/api.md) for the REST endpoints, and [Development Guide](docs/development.md) for setup and test commands.

## Getting started

### Prerequisites

- Java 25
- Node.js and npm versions compatible with the Angular 22 toolchain
- OpenSSL (to generate a local JWT secret)

The repository includes the Maven Wrapper, so a separate Maven installation is not required.

### 1. Configure the backend secret

The backend requires the `GYMRATS_JWT_SECRET` environment variable. The secret must contain at least 32 bytes because the application uses HS256.

```bash
export GYMRATS_JWT_SECRET="$(openssl rand -base64 32)"
```

Use your own secret for each environment. Do not commit it to the repository.

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API is available at `http://localhost:8080`. The `dev` profile also enables the H2 console at `http://localhost:8080/h2-console`.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend/gymrats-ui
npm ci
npm start
```

Open `http://localhost:4200`. The development server forwards API requests to `http://localhost:8080` using `proxy.conf.json`.

### Local development account

When the backend runs with the `dev` profile, a local test account is seeded if it does not already exist:

| Email | Password |
| --- | --- |
| `test@user.com` | `TestPassword123` |

These credentials are for local development only. Do not reuse them in a deployed environment.

## Tests and quality checks

Run the commands from the relevant project directory.

**Backend** (`backend/`):

```bash
./mvnw test
```

**Frontend** (`frontend/gymrats-ui/`):

```bash
npm test -- --watch=false
npm run lint
npm run build
```

**End-to-end tests:**

The TestCafe suite expects the backend to run with the `e2e` profile and the frontend development server to be available at `http://localhost:4200`. The current TestCafe configuration uses Brave at `/usr/bin/brave-browser`. If you want to use a browser you have already installed, change this path accordingly.

Start the backend with the isolated in-memory E2E database:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=e2e
```

Start the frontend in another terminal, then run:

```bash
cd frontend/gymrats-ui
npm run test:e2e
```

The E2E profile recreates its in-memory database when the backend starts. The test account is seeded automatically in both `dev` and `e2e` profiles.

## Current scope and future goals

The current application scope focuses on individual user accounts, personal workout plans, a shared exercise catalogue, and saved training sessions.

A possible future goal is to introduce role-based access and trainer-to-athlete assignment, including the ability for trainers to manage assigned athletes' workout plans and training history.

## Project structure

```text
.
├── backend/                 # Spring Boot REST API
│   └── src/
│       ├── main/java/       # Controllers, services, repositories and entities
│       └── test/java/       # Backend tests
├── frontend/
│   └── gymrats-ui/          # Angular application
│       ├── e2e/             # TestCafe end-to-end tests
│       └── src/app/         # Application features and shared UI
└── docs/                    # Project documentation
```
