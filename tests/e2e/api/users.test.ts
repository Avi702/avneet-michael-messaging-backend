import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { makeRequest } from "../shared/makeRequest";
import { createTestRegistration, extractCredentials, makeUser } from "../shared/makeUser";

let server: Awaited<ReturnType<typeof createTestServer>>;

beforeAll(async () => {
    server = await createTestServer();
});

afterAll(async () => {
    await server.manager.shutdown();
});

describe("users routes", () => {
    describe("getUserById endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "users/getUserById", {
                userId: "hello",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/getUserById", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/getUserById", {
                userId: "507f191e810c19729de860ea",
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson1 = await makeUser(server.baseUrl);
            const loginJson2 = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/getUserById", {
                userId: loginJson2.user._id.toString(),
            }, loginJson1.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json._id.toString()).toBe(loginJson2.user._id.toString());
        })
    });

    describe("getUserByEmail endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "users/getUserByEmail", {
                email: "example@example.com",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/getUserByEmail", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/getUserByEmail", {
                email: "willnevergenerate@no.com",
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson1 = await makeUser(server.baseUrl);
            // Must manually create user; makeUser does not expose email (publicUser)
            const registration = createTestRegistration();
            const credentials = extractCredentials(registration);
            await makeRequest(server.baseUrl, "authentication/register", registration);
            const loginResult = await makeRequest(server.baseUrl, "authentication/login", credentials);
            const loginJson2 = await loginResult.json();
            const res = await makeRequest(server.baseUrl, "users/getUserByEmail", {
                email: registration.email,
            }, loginJson1.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json._id.toString()).toBe(loginJson2.user._id.toString());
        })
    });

    describe("updateProfile endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "users/updateProfile", {
                displayName: "New Name"
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/updateProfile", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "users/updateProfile", {
                displayName: "New Name"
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
        });
    });
});
