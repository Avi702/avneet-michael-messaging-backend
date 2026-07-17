import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { makeRequest } from "../shared/makeRequest";

let server: Awaited<ReturnType<typeof createTestServer>>;

beforeAll(async () => {
    server = await createTestServer();
});

afterAll(async () => {
    await server.manager.shutdown();
});

describe("health routes", () => {
    test("starts up the server", async () => {
        const res = await makeRequest(server.baseUrl, "health");
    
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toStrictEqual({ ok: true });
    });
});
