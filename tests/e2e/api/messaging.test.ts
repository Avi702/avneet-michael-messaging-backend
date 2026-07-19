import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { createTestServer } from "../../../src/manager/createTestServer";
import { makeRequest } from "../shared/makeRequest";
import { makeUser } from "../shared/makeUser";

let server: Awaited<ReturnType<typeof createTestServer>>;

beforeAll(async () => {
    server = await createTestServer();
});

afterAll(async () => {
    await server.manager.shutdown();
});

describe("messaging routes", () => {
    describe("createChat endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/createChat", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello"
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.title).toBe("Hello");
            expect(json.owner).toBe(loginJson.user._id.toString());
        });
    });

    describe("getChat endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "messaging/getChat", {
                title: "Hello",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/getChat", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/getChat", {
                chatId: "507f191e810c19729de860ea"
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("CHAT_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const created = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello"
            }, loginJson.accessToken);
            const createdJson = await created.json();
            const res = await makeRequest(server.baseUrl, "messaging/getChat", {
                chatId: createdJson._id,
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json._id).toStrictEqual(createdJson._id);
        });
    });

    describe("addMemberToChat endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
                chatId: "507f191e810c19729de860ea",
                userId: "507f191e810c19729de860ea"
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects chat does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const loginJson2 = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
                chatId: "507f191e810c19729de860ea",
                userId: loginJson2.user._id.toString(),
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("CHAT_NOT_FOUND");
        });

        test("rejects user does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const createdChat = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello world",
            }, loginJson.accessToken);
            const createdChatJson = await createdChat.json();
            const res = await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
                chatId: createdChatJson._id,
                userId: "507f191e810c19729de860ea"
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const loginJson2 = await makeUser(server.baseUrl);
            const createdChat = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello world",
            }, loginJson.accessToken);
            const createdChatJson = await createdChat.json();
            const res = await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
                chatId: createdChatJson._id,
                userId: loginJson2.user._id.toString(),
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
        });
    });

    describe("removeMemberFromChat endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "messaging/removeMemberFromChat", {
                chatId: "507f191e810c19729de860ea",
                userId: "507f191e810c19729de860ea"
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/removeMemberFromChat", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects chat does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const loginJson2 = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/removeMemberFromChat", {
                chatId: "507f191e810c19729de860ea",
                userId: loginJson2.user._id.toString(),
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("CHAT_NOT_FOUND");
        });

        test("rejects user does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const createdChat = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello world",
            }, loginJson.accessToken);
            const createdChatJson = await createdChat.json();
            const res = await makeRequest(server.baseUrl, "messaging/removeMemberFromChat", {
                chatId: createdChatJson._id,
                userId: "507f191e810c19729de860ea"
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("USER_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const loginJson2 = await makeUser(server.baseUrl);
            const createdChat = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello world",
            }, loginJson.accessToken);
            const createdChatJson = await createdChat.json();
            await makeRequest(server.baseUrl, "messaging/addMemberToChat", {
                chatId: createdChatJson._id,
                userId: loginJson2.user._id.toString(),
            }, loginJson.accessToken);
            const res = await makeRequest(server.baseUrl, "messaging/removeMemberFromChat", {
                chatId: createdChatJson._id,
                userId: loginJson2.user._id.toString(),
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
        });
    });

    describe("updateChatInformation endpoint", () => {
        test("rejects not authenticated", async () => {
            const res = await makeRequest(server.baseUrl, "messaging/updateChatInformation", {
                chatId: "507f191e810c19729de860ea",
                title: "new Title",
            });
            expect(res.status).toBe(401);
            const json = await res.json();
            expect(json.error.code).toBe("UNAUTHORIZED");
        });

        test("rejects invalid format", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/updateChatInformation", {
            }, loginJson.accessToken);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error.code).toBe("BAD_REQUEST");
        });

        test("rejects chat does not exist", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const res = await makeRequest(server.baseUrl, "messaging/updateChatInformation", {
                chatId: "507f191e810c19729de860ea",
                title: "new Title",
            }, loginJson.accessToken);
            expect(res.status).toBe(404);
            const json = await res.json();
            expect(json.error.code).toBe("CHAT_NOT_FOUND");
        });

        test("accepts valid input", async () => {
            const loginJson = await makeUser(server.baseUrl);
            const createdChat = await makeRequest(server.baseUrl, "messaging/createChat", {
                title: "Hello world",
            }, loginJson.accessToken);
            const createdChatJson = await createdChat.json();
            const res = await makeRequest(server.baseUrl, "messaging/updateChatInformation", {
                chatId: createdChatJson._id,
                title: "New Title",
            }, loginJson.accessToken);
            expect(res.status).toBe(200);
            const json = await res.json();
            expect(json.success).toBe(true);
        });
    });

    // Testing uploadImage requires sending a message, which is only available via the Socket.IO API
    // Thus tests for uploadImage and getImage are located in the live e2e test folder
});
