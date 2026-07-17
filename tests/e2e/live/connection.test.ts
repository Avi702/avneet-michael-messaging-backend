import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { createTestRegistration, extractCredentials, makeUser } from "../shared/makeUser";
import { makeRequest } from "../shared/makeRequest";
import { io } from "socket.io-client";

let server: Awaited<ReturnType<typeof createTestServer>>;

beforeAll(async () => {
    server = await createTestServer();
});

afterAll(async () => {
    await server.manager.shutdown();
});

describe("connecting to server", () => {
    test("client connects to the server", async () => {
        const user = await makeUser(server.baseUrl);
        const socket = io(`${server.baseUrl}`, {
            auth: {
                token: user.accessToken,
            },
        });

        await new Promise<void>((resolve, reject) => {
            socket.once("connect", () => {
                resolve();
            });

            socket.once("connect_error", (err) => {
                reject(err);
            });
        });

        expect(socket.connected).toBe(true);

        socket.close();
    });

    test("server rejects invalid auth token", async () => {
        const socket = io(`${server.baseUrl}`, {
            auth: {
                token: "invalid-token",
            },
        });

        const error = await new Promise<Error>((resolve, reject) => {
            socket.once("connect", () => {
                reject("Connection somehow established");
            });

            socket.once("connect_error", (err) => {
                resolve(err);
            });
        });

        expect(error).toBeDefined();
        expect(socket.connected).toBe(false);
        
        socket.close();
    });
});
