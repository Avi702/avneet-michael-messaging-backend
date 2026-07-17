import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { makeUser } from "../shared/makeUser";
import { io, Socket } from "socket.io-client";
import { LoginResult } from "../../../src/authentication/AuthenticationService";
import { extractResponse } from "./extractResponse";
import { makeRequest } from "../shared/makeRequest";

let server: Awaited<ReturnType<typeof createTestServer>>;
let userBob: LoginResult;
let socketBob: Socket;
let userAlice: LoginResult;
let socketAlice: Socket;

beforeAll(async () => {
    server = await createTestServer();
    userBob = await makeUser(server.baseUrl);
    socketBob = io(`${server.baseUrl}`, {
        auth: {
            token: userBob.accessToken,
        },
    });
    await new Promise<void>((resolve, reject) => {
        socketBob.once("connect", () => {
            resolve();
        });

        socketBob.once("connect_error", (err) => {
            reject(err);
        });
    });
    userAlice = await makeUser(server.baseUrl);
    socketAlice = io(`${server.baseUrl}`, {
        auth: {
            token: userAlice.accessToken,
        },
    });
    await new Promise<void>((resolve, reject) => {
        socketAlice.once("connect", () => {
            resolve();
        });

        socketAlice.once("connect_error", (err) => {
            reject(err);
        });
    });
});

afterAll(async () => {
    await server.manager.shutdown();
});

describe("message:send", () => {
    test("rejects invalid format", async () => {
        const promise = extractResponse(socketBob, "reply:message:send");
        socketBob.emit("message:send", {});
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("rejects chat does not exist", async () => {
        const promise = extractResponse(socketBob, "reply:message:send");
        socketBob.emit("message:send", {
            chatId: "",
            textContent: "Hello world",
        });
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("rejects not in chat", async () => {
        // Create chat as Alice
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello" }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        const promise = extractResponse(socketBob, "reply:message:send");
        // Send message as Bob; should fail
        socketBob.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "Hello world",
        });
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("successfully sends a message", async () => {
        // Create chat as Alice
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello" }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        const promise = extractResponse(socketBob, "reply:message:send");
        // Send message as Bob; should succeed
        socketBob.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "Hello world",
        });
        const res = await promise;
        expect(res.success).toBe(true);
    });

    test("successfully broadcasts message to other users in chat", async () => {
        // Create chat as Alice
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello" }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Subscribe Alice to the chat's live messages
        socketAlice.emit("chat:open", { chatId: createChatJson._id });
        const promise = extractResponse(socketAlice, "message:new");
        // Send message as Bob; should succeed
        socketBob.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "Hello world",
        });
        const res = await promise;
        expect(res.success).toBe(true);
        expect(res.message.sender).toStrictEqual(userBob.user._id.toString());
        expect(res.message.textContent).toBe("Hello world");
    });
});
