import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { makeRequest } from "./fetchUtility";

let server: Awaited<ReturnType<typeof createTestServer>>;

beforeAll(async () => {
    server = await createTestServer();
});

afterAll(async () => {
    await server.manager.shutdown();
});

let testCredentialsCount = 0;
const exampleCredentials = {
    email: "example@example.com",
    password: "password",
};

const exampleRegistration = {
    ...exampleCredentials,
    birthDate: "2000-01-01",
    displayName: "John Doe",
};
function createTestRegistration() {
    testCredentialsCount = testCredentialsCount + 1;
    return {
        ...exampleRegistration,
        email: `example${testCredentialsCount}@example.com`,
    };
}
function extractCredentials(registration: any): any {
    return {
        email: registration.email,
        password: registration.password,
    };
}

describe("authentication routes", () => {
    describe("login endpoint", () => {
        test("accepts valid input", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration
            })
            const res = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials
            });
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
            expect(json.refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
            expect(json.user.displayName).toBe("John Doe");
        });

        test("returns USER_NOT_FOUND when user does not exist", async () => {
            // Do not make a user
            const res = await makeRequest(server.baseUrl, "authentication/login", {
                ...extractCredentials(createTestRegistration())
            });
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_FOUND");
        });

        test("returns PASSWORD_INCORRECT when the password is incorrect", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Try to log in
            const res = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials,
                password: "notPassword",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("PASSWORD_INCORRECT");
        });

        test("rejects invalid format", async () => {
            // empty body
            const res = await makeRequest(server.baseUrl, "authentication/login", {

            });
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });
    });

    describe("register endpoint", () => {
        test("accepts valid input", async () => {
            const registration = createTestRegistration();
            // Make a user
            const res = await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.displayName).toBe("John Doe");
        });

        test("rejects invalid format", async () => {
            // empty body
            const res = await makeRequest(server.baseUrl, "authentication/register", {

            });
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects user already exists", async () => {
            const registration = createTestRegistration();
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            const res = await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            expect(res.status).toBe(409);
            const json = await res.json();
            expect(json.error.code).toBe("USER_ALREADY_EXISTS");
        });

        test("rejects user not old enough", async () => {
            const registration = createTestRegistration();
            const res = await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
                birthDate: "9999-01-01", // will reject impossible birth date (seriously if someone's running this test in 9999...)
            });
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_OLD_ENOUGH");
        });
    });

    describe("authenticate endpoint", () => {
        test("accepts valid input", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Login and get the token
            const loginResult = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials,
            });
            const loginJson = await loginResult.json();
            const accessToken = loginJson.accessToken;
            // Make the actual authentication test result and ensure parity
            const authenticationResult = await makeRequest(server.baseUrl, "authentication/authenticate", {
                accessToken: accessToken,
            });
            expect(authenticationResult.status).toBe(200);
            const authenticationJson = await authenticationResult.json();
            expect(authenticationJson._id).toBe(loginJson.user._id);
        });

        test("rejects invalid token", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Make the actual authentication test result and ensure parity
            const authenticationResult = await makeRequest(server.baseUrl, "authentication/authenticate", {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            });
            expect(authenticationResult.status).toBe(401);
            const authenticationJson = await authenticationResult.json();
            expect(authenticationJson.error.code).toBe("INVALID_TOKEN");
        });

        test("rejects invalid format", async () => {
            const res = await makeRequest(server.baseUrl, "authentication/authenticate", {});
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        // User not found case is an edge case, very difficult to test and should never happen because this would require a user to be deleted at the database level mid-login
    });

    describe("refresh endpoint", () => {
        test("accepts valid input", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Login and get the token
            const loginResult = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials,
            });
            const loginJson = await loginResult.json();
            const refreshToken = loginJson.refreshToken;
            // Make the actual authentication test result and ensure parity
            const authenticationResult = await makeRequest(server.baseUrl, "authentication/refresh", {
                refreshToken: refreshToken,
            });
            expect(authenticationResult.status).toBe(200);
        });

        test("rejects invalid token", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Make the actual authentication test result and ensure parity
            const refreshResult = await makeRequest(server.baseUrl, "authentication/refresh", {
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            });
            expect(refreshResult.status).toBe(401);
            const authenticationJson = await refreshResult.json();
            expect(authenticationJson.error.code).toBe("INVALID_TOKEN");
        });

        test("rejects invalid format", async () => {
            const res = await makeRequest(server.baseUrl, "authentication/refresh", {});
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        // User not found case is an edge case, very difficult to test and should never happen because this would require a user to be deleted at the database level mid-login
    });

    describe("update password", () => {
        test("rejects no authentication token", async () => {
            const res = await makeRequest(server.baseUrl, "authentication/updatePassword", {});
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Login and get the token
            const loginResult = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials,
            });
            const loginJson = await loginResult.json();
            const accessToken = loginJson.accessToken;
            const res = await makeRequest(server.baseUrl, "authentication/updatePassword", {}, accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("accepts valid input", async () => {
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            // Make a user
            await makeRequest(server.baseUrl, "authentication/register", {
                ...registration,
            });
            // Login and get the token
            const loginResult = await makeRequest(server.baseUrl, "authentication/login", {
                ...credentials,
            });
            const loginJson = await loginResult.json();
            const accessToken = loginJson.accessToken;
            const updatePasswordResult = await makeRequest(server.baseUrl, "authentication/updatePassword", {
                password: "hello world",
            }, accessToken);
            expect(updatePasswordResult.status).toBe(200);
            const updatePasswordJson = await updatePasswordResult.json();
            expect(updatePasswordJson.success).toBe(true);
        });
    });
});
