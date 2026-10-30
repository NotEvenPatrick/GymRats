# Development guide

This guide describes how to run and test the current GymRats codebase locally.

## Prerequisites

- Java 25
- Node.js and npm compatible with the Angular 22 toolchain
- OpenSSL for generating a local JWT secret
- Brave browser at `/usr/bin/brave-browser` to run the current TestCafe suite

The repository includes the Maven Wrapper (`backend/mvnw`). A separate Maven installation is not required.

## Backend setup

The backend requires `GYMRATS_JWT_SECRET` at startup. It must contain at least 32 bytes because the API signs JWTs using HS256.

Generate a local secret in your shell:

```bash
export GYMRATS_JWT_SECRET="$(openssl rand -base64 32)"
```

Do not put the secret in source control. Use a different secret for each environment.

### Run with the development profile

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API starts on `http://localhost:8080`.

The default datasource is a file-based H2 database using:

```text
jdbc:h2:file:./data/gymrats
```

The relative path is resolved from the backend process's working directory. The `dev` profile enables the H2 console at `http://localhost:8080/h2-console`.

H2 console connection details for the default configuration:

| Setting | Value |
| --- | --- |
| JDBC URL | `jdbc:h2:file:./data/gymrats` |
| Username | `sa` |
| Password | *(empty)* |

The H2 console is intended for local development only. Do not expose it publicly.

The `dev` profile seeds a local account if it does not already exist:

| Email | Password |
| --- | --- |
| `test@user.com` | `TestPassword123` |

The exercise data initializer also inserts its predefined catalogue entries when they are missing.

## Frontend setup

In a separate terminal:

```bash
cd frontend/gymrats-ui
npm ci
npm start
```

The Angular development server runs at `http://localhost:4200`. Its development configuration loads `proxy.conf.json`, which forwards `/api/**` requests to `http://localhost:8080`.

## Tests and quality checks

Run backend commands from `backend/`:

```bash
./mvnw test
```

Run frontend commands from `frontend/gymrats-ui/`:

```bash
npm test -- --watch=false
npm run lint
npm run build
```

To generate frontend coverage output:

```bash
npm test -- --watch=false --coverage
```

These commands describe how to run the checks; test counts and coverage percentages are not stated here because they depend on the exact code revision and execution environment.

## End-to-end tests

The E2E tests use TestCafe and the browser path configured in `.testcaferc.cjs`:

```text
/usr/bin/brave-browser
```

Make sure Brave is installed at that path, or update the TestCafe configuration for your environment.

Start the backend with the `e2e` profile:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=e2e
```

This profile uses an in-memory H2 database, recreates the schema when the backend starts, disables the H2 console, and binds the server to localhost.

Start the frontend in another terminal:

```bash
cd frontend/gymrats-ui
npm start
```

Then run the suite from the frontend directory:

```bash
npm run test:e2e
```

The `dev` and `e2e` profiles both seed the local test account used by the E2E helpers (`test@user.com` / `TestPassword123`). The E2E profile is isolated from the default file-based development database.

## Relevant configuration files

| File | Purpose |
| --- | --- |
| `backend/src/main/resources/application.properties` | Default application, JWT, and H2 file-database configuration. |
| `backend/src/main/resources/application-dev.properties` | Enables the H2 console for local development. |
| `backend/src/main/resources/application-e2e.properties` | Configures the isolated in-memory database for E2E tests. |
| `frontend/gymrats-ui/proxy.conf.json` | Proxies frontend API calls to the local backend. |
| `frontend/gymrats-ui/.testcaferc.cjs` | Configures the browser and E2E test files for TestCafe. |
