import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MessagingRepository } from "../MessagingRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { MessagingAuthorizationService } from "../MessagingAuthorizationService";
import { MessagingService } from "../MessagingService";
import { UserRepository } from "../../users/UserRepository";

describe("MessagingRepository", () => {
    let mongo: MongoMemoryServer;
    let users: UserRepository;
    let repository: MessagingRepository;
    let authorization: MessagingAuthorizationService;
    let service: MessagingService;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        users = new UserRepository();
        repository = new MessagingRepository();
        authorization = new MessagingAuthorizationService(repository);
        service = new MessagingService(repository, authorization, users);
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.db?.dropDatabase();
    });

    const OID_1 = new mongoose.Types.ObjectId("ffffffffffffffffffffffff");
    const OID_2 = new mongoose.Types.ObjectId("efffffffffffffffffffffff");
    const OID_3 = new mongoose.Types.ObjectId("dfffffffffffffffffffffff");

    const GENERIC_CHAT_CREATION_DTO = {
        title: "Hello",
    };

    const GENERIC_USER_CREATION_DTO = {
        displayName: "John Doe",
        birthDate: "2000-01-01",
        email: "johndoe@example.com",
        password: "password",
    };

    test("creates a new chat", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        expect(chat.owner).toStrictEqual(OID_1);
        expect(chat.title).toBe("Hello");
        expect(chat.members).toEqual([]);
    });

    test("gets a chat", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const found = await service.getChat(chat._id.toString(), OID_1.toString());
        expect(found?._id.toString()).toStrictEqual(chat._id.toString());
        // chat does not exist
        await expect(service.getChat(OID_1.toString(), OID_1.toString())).rejects.toThrow();
        // user not authorized
        await expect(service.getChat(chat._id.toString(), OID_3.toString())).rejects.toThrow();
    });

    test("adds a member to a chat", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
        const response = await service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
        expect(response).toBe(true);
        await expect(service.addMemberToChat(chat._id.toString(), OID_2.toString(), OID_3.toString())).rejects.toThrow();
    });

    test("removes a member from a chat", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
        const response1 = await service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
        expect(response1).toBe(true);
        // no authorization case
        console.log(chat.owner, OID_2.toString());
        expect(() => service.removeMemberFromChat(chat._id.toString(), OID_2.toString(), createdUser._id.toString())).rejects.toThrow();
        // success case
        const response2 = await service.removeMemberFromChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
        expect(response2).toBe(true);
        // chat doesn't exist case
        await expect(service.removeMemberFromChat(OID_1.toString(), "-1", "-1")).rejects.toThrow();
    });

    test("updates chat information", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        // update
        await service.updateChatInformation(chat._id.toString(), chat.owner.toString(), {
            title: "Test"
        });
        const updated = await repository.findChatById(chat._id.toString());
        expect(updated?.title).toBe("Test");
        // no access
        await expect(service.updateChatInformation(chat._id.toString(), OID_3.toString(), {
            title: "Test2"
        })).rejects.toThrow();
        expect((await repository.findChatById(chat._id.toString()))?.title).toBe("Test");
        // chat does not exist
        await expect(service.updateChatInformation(OID_3.toString(), OID_3.toString(), { title: "" })).rejects.toThrow();
    });

    test("sends a message", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await service.sendMessage(chat._id.toString(), OID_1.toString(), {
            textContent: "Hello",
        });
        expect(message.chat.toString()).toBe(chat._id.toString());
        expect(message.textContent).toBe("Hello");
        // chat does not exist
        await expect(service.sendMessage(OID_1.toString(), OID_1.toString(), { textContent: "" })).rejects.toThrow();
        // user unauthorized
        await expect(service.sendMessage(chat._id.toString(), OID_3.toString(), { textContent: "" })).rejects.toThrow();
    });

    test("uploads an image", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await service.sendMessage(chat._id.toString(), OID_1.toString(), {
            textContent: "Hello",
        });
        const image = await service.uploadImage(message._id.toString(), OID_1.toString(), {
            uri: "test",
        });
        expect(image.message.toString()).toBe(message._id.toString());
        expect(image.uri).toBe("test");
        // chat does not exist
        await expect(service.uploadImage(OID_1.toString(), OID_1.toString(), { uri: "" })).rejects.toThrow();
        // user unauthorized
        await expect(service.uploadImage(chat._id.toString(), OID_3.toString(), { uri: "" })).rejects.toThrow();
    });

    test("gets an image", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await service.sendMessage(chat._id.toString(), OID_1.toString(), {
            textContent: "Hello",
        });
        const image = await service.uploadImage(message._id.toString(), OID_1.toString(), {
            uri: "test",
        });
        const found = await service.getImage(image._id.toString(), OID_1.toString());
        expect(found._id.toString()).toBe(image._id.toString());
        // image does not exist
        await expect(service.getImage(OID_1.toString(), OID_1.toString())).rejects.toThrow();
        // user unauthorized
        await expect(service.getImage(image._id.toString(), OID_3.toString())).rejects.toThrow();
    });

    test("gets paginated messages", async () => {
        const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        for (let i = 0; i < 100; i++) {
            await service.sendMessage(chat._id.toString(), OID_1.toString(), {
                textContent: `Hello${i}`
            });
        }
        const initial = await service.getMessages(chat._id.toString(), OID_1.toString());
        expect(initial.length).toBe(50);
        expect(initial[0]?.textContent).toBe("Hello99");
        expect(initial[1]?.textContent).toBe("Hello98");
        expect(initial[2]?.textContent).toBe("Hello97");
        const next = await service.getMessages(chat._id.toString(), OID_1.toString(), 10, initial[49]?.createdAt, initial[49]?._id.toString());
        expect(next.length).toBe(10);
        expect(next[0]?.textContent).toBe("Hello49");
        // chat does not exist
        await expect(service.getMessages(OID_1.toString(), OID_1.toString())).rejects.toThrow();
        // not authorized
        await expect(service.getMessages(chat._id.toString(), OID_3.toString())).rejects.toThrow();
    });
});
