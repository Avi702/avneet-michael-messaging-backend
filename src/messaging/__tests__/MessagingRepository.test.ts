import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MessagingRepository } from "../MessagingRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";

describe("MessagingRepository", () => {
    let mongo: MongoMemoryServer;
    let repository: MessagingRepository;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new MessagingRepository();
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.collection("chats").deleteMany({});
        await mongoose.connection.collection("messages").deleteMany({});
        await mongoose.connection.collection("images").deleteMany({});
    });

    const OID_1 = new mongoose.Types.ObjectId("ffffffffffffffffffffffff");
    const OID_2 = new mongoose.Types.ObjectId("efffffffffffffffffffffff");
    const OID_3 = new mongoose.Types.ObjectId("dfffffffffffffffffffffff");

    const GENERIC_CHAT_CREATION_DTO = {
        title: "Hello",
    };

    test("creates a new chat", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        expect(chat.owner).toStrictEqual(OID_1);
        expect(chat.title).toBe("Hello");
        expect(chat.members).toEqual([]);
    });

    test("finds a chat by id", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const found = await repository.findChatById(chat._id.toString());
        expect(found?._id.toString()).toStrictEqual(chat._id.toString());
        const notFound = await repository.findChatById(OID_1.toString());
        expect(notFound).toBe(null);
    });

    test("adds a member to a chat", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const response = await repository.addMemberToChat(chat._id.toString(), OID_2.toString());
        expect(response).not.toBe(null);
        expect(response?.members).toStrictEqual([OID_2]);
    });

    test("removes a member from a chat", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const response1 = await repository.addMemberToChat(chat._id.toString(), OID_2.toString());
        expect(response1).not.toBe(null);
        expect(response1?.members).toStrictEqual([OID_2]);
        const response2 = await repository.removeMemberFromChat(chat._id.toString(), OID_2.toString());
        expect(response2).not.toBe(null);
        expect(response2?.members).toStrictEqual([]);
    });

    test("updates a chat's information", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const response = await repository.updateChatInformation(chat._id.toString(), {
            title: "New"
        });
        expect(response?.title).toBe("New");
    });

    test("sends a message", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await repository.sendMessage(chat._id.toString(), {
            sender: OID_1,
            textContent: "Hello world",
        });
        expect(message).not.toBe(null);
        expect(message.textContent).toBe("Hello world");
        expect(message.chat._id.toString()).toStrictEqual(chat._id.toString());
    });

    test("uploads an image", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await repository.sendMessage(chat._id.toString(), {
            sender: OID_1,
            textContent: "Hello world",
        });
        const image = await repository.uploadImage(message._id.toString(), {
            uri: "test",
        });
        expect(image).not.toBe(null);
        expect(image.uri).toBe("test");
        expect(image.message.toString()).toStrictEqual(message._id.toString());
    });

    test("finds an image", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await repository.sendMessage(chat._id.toString(), {
            sender: OID_1,
            textContent: "Hello world",
        });
        const image = await repository.uploadImage(message._id.toString(), {
            uri: "test",
        });
        const found = await repository.findImageById(image._id.toString());
        expect(found).not.toBe(null);
        expect(found?.uri).toBe("test");
        expect(found?.message.toString()).toStrictEqual(message._id.toString());
    });

    test("gets paginated messages", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        for (let i = 0; i < 100; i++) {
            await repository.sendMessage(chat._id.toString(), {
                sender: OID_1,
                textContent: `Hello${i}`
            });
        }
        const initial = await repository.getMessages(chat._id.toString());
        expect(initial.length).toBe(50);
        expect(initial[0]?.textContent).toBe("Hello99");
        expect(initial[1]?.textContent).toBe("Hello98");
        expect(initial[2]?.textContent).toBe("Hello97");
        const next = await repository.getMessages(chat._id.toString(), 10, initial[49]?.createdAt, initial[49]?._id.toString());
        expect(next.length).toBe(10);
        expect(next[0]?.textContent).toBe("Hello49");
    });

    test("finds a message by id", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        const message = await repository.sendMessage(chat._id.toString(), {
            sender: OID_1,
            textContent: "Hello world",
        });
        const found = await repository.findMessageById(message._id.toString());
        expect(found?._id.toString()).toBe(message._id.toString());
    });
});
