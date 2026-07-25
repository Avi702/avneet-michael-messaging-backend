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

const randomBuffer = new Uint8Array(1024).fill(99);
const randomImageFile = new File([randomBuffer], "fake.png", {
    type: "image/png",
});

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
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
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
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
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
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Subscribe Alice to the chat's live messages
        socketAlice.emit("chat:open", { chatId: createChatJson._id });
        const aliceReceivePromise = extractResponse(socketAlice, "message:new");
        const bobSendPromise = extractResponse(socketBob, "reply:message:send");
        // Send message as Bob; should succeed
        socketBob.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "Hello world",
        });
        await bobSendPromise;
        const res = await aliceReceivePromise;
        expect(res.success).toBe(true);
        expect(res.message.sender).toStrictEqual(userBob.user._id.toString());
        expect(res.message.textContent).toBe("Hello world");
    });
});

describe("message:get", () => {
    test("rejects invalid format", async () => {
        const promise = extractResponse(socketBob, "reply:message:get");
        socketBob.emit("message:get", {});
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("rejects chat does not exist", async () => {
        const promise = extractResponse(socketBob, "reply:message:get");
        socketBob.emit("message:get", {
            chatId: "",
        });
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("rejects not in chat", async () => {
        // Create chat as Alice
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        const promise = extractResponse(socketBob, "reply:message:get");
        // Get messages as Bob; should fail
        socketBob.emit("message:get", {
            chatId: createChatJson._id,
        });
        const res = await promise;
        expect(res.success).toBe(false);
    });

    test("successfully gets message", async () => {
        // This only tests communication of the message
        // Intended behavior (pagination, etc.) is tested in unit testing
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Send a message as Alice
        socketAlice.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "Hello world",
        });
        const promise = extractResponse(socketBob, "reply:message:get");
        // Get messages as Bob; should fail
        socketBob.emit("message:get", {
            chatId: createChatJson._id,
        });
        const res = await promise;
        expect(res.success).toBe(true);
        expect(res.messages.length).toBe(1);
        expect(res.messages[0].textContent).toBe("Hello world");
    });
});

describe("image uploading", () => {
    test("rejects nonexistent message", async () => {
        const form = new FormData();
        form.append("image", randomImageFile);
        form.append("messageId", "507f191e810c19729de860ea");
        const res = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userBob.accessToken, null);
        expect(res.status).toBe(404);
        const json = await res.json();
        console.log("error: ", JSON.stringify(json));
        expect(json.error.code).toBe("MESSAGE_NOT_FOUND");
    });

    test("rejects invalid format", async () => {
        const form = new FormData();
        form.append("image", randomImageFile);
        const res = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userBob.accessToken, null);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("BAD_REQUEST");
    });

    test("rejects not owner of message", async () => {
        // Create chat as Alice
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Send message as Alice
        const promise = extractResponse(socketAlice, "reply:message:send");
        socketAlice.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "test",
        });
        const sendMessageResponse = await promise;
        // Upload image as Bob
        const form = new FormData();
        form.append("image", randomImageFile);
        form.append("messageId", sendMessageResponse.message._id);
        const res = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userBob.accessToken, null);
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error.code).toBe("UNAUTHORIZED");
    });

    test("accepts valid input", async () => {
        // Create chat as Alice
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Send message as Alice
        const promise = extractResponse(socketAlice, "reply:message:send");
        socketAlice.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "test",
        });
        const sendMessageResponse = await promise;
        // Upload image as Alice
        const form = new FormData();
        form.append("image", randomImageFile);
        form.append("messageId", sendMessageResponse.message._id);
        const res = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userAlice.accessToken, null);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.message).toBe(sendMessageResponse.message._id);
    });
});

describe("image getting", () => {
    test("rejects unauthorized", async () => {
        const res = await makeRequest(server.baseUrl, "messaging/getImage", {
            imageId: "507f191e810c19729de860ea",
        });
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error.code).toBe("UNAUTHORIZED");
    });

    test("rejects nonexistent image", async () => {
        const res = await makeRequest(server.baseUrl, "messaging/getImage", {
            imageId: "507f191e810c19729de860ea",
        }, userBob.accessToken);
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error.code).toBe("IMAGE_NOT_FOUND");
    });

    test("rejects invalid format", async () => {
        const res = await makeRequest(server.baseUrl, "messaging/getImage", {
            imageId: "",
        }, userBob.accessToken);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.code).toBe("BAD_REQUEST");
    });

    test("rejects not in chat", async () => {
        // Create chat as Alice
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Send message as Alice
        const promise = extractResponse(socketAlice, "reply:message:send");
        socketAlice.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "test",
        });
        const sendMessageResponse = await promise;
        // Upload image as Alice
        const form = new FormData();
        form.append("image", randomImageFile);
        form.append("messageId", sendMessageResponse.message._id);
        const uploadImageResult = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userAlice.accessToken, null);
        const uploadImageJson = await uploadImageResult.json();
        // Get image as Bob
        const res = await makeRequest(server.baseUrl, "messaging/getImage", { imageId: uploadImageJson._id }, userBob.accessToken);
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error.code).toBe("UNAUTHORIZED");
    });

    test("accepts valid input", async () => {
        // Create chat as Alice
        const member = await makeUser(server.baseUrl);
        const createChatResult = await makeRequest(server.baseUrl, "messaging/createChat", { title: "hello", members: [member.user._id.toString()] }, userAlice.accessToken);
        const createChatJson = await createChatResult.json();
        // Add Bob to chat
        await makeRequest(server.baseUrl, "messaging/addMemberToChat", { chatId: createChatJson._id, userId: userBob.user._id.toString() }, userAlice.accessToken);
        // Send message as Alice
        const promise = extractResponse(socketAlice, "reply:message:send");
        socketAlice.emit("message:send", {
            chatId: createChatJson._id,
            textContent: "test",
        });
        const sendMessageResponse = await promise;
        // Upload image as Alice
        const form = new FormData();
        form.append("image", randomImageFile);
        form.append("messageId", sendMessageResponse.message._id);
        const uploadImageResult = await makeRequest(server.baseUrl, "messaging/uploadImage", form, userAlice.accessToken, null);
        const uploadImageJson = await uploadImageResult.json();
        // Get image as Bob
        const res = await makeRequest(server.baseUrl, "messaging/getImage", { imageId: uploadImageJson._id }, userBob.accessToken);
        expect(res.status).toBe(200);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        expect(buffer).toStrictEqual(Buffer.from(randomBuffer));
    });
})
