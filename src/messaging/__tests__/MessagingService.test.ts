import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MessagingRepository } from "../MessagingRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { MessagingAuthorizationService } from "../MessagingAuthorizationService";
import { MessagingService } from "../MessagingService";
import { UserRepository } from "../../users/UserRepository";
import { UnauthorizedError } from "../../shared/errors/common";
import { ChatNotFoundError, ImageNotFoundError, MessageNotFoundError, UserAlreadyInChatError, UserNotInChatError, UserOwnsChatError } from "../../shared/errors/messaging";
import { UserNotFoundError } from "../../shared/errors/users";

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

    describe("createChat method", () => {
        test("creates a new chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            expect(chat.owner).toStrictEqual(OID_1);
            expect(chat.title).toBe("Hello");
            expect(chat.members).toEqual([]);
        });
    });

    describe("getChat method", () => {
        test("gets a chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const found = await service.getChat(chat._id.toString(), OID_1.toString());
            expect(found?._id.toString()).toStrictEqual(chat._id.toString());
            // chat does not exist
            await expect(service.getChat(OID_1.toString(), OID_1.toString())).rejects.toThrow();
            // user not authorized
            await expect(service.getChat(chat._id.toString(), OID_3.toString())).rejects.toThrow();
        });

        test("rejects unauthorized user", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.getChat(chat._id.toString(), OID_3.toString())).rejects.toThrow(UnauthorizedError);
        });

        test("rejects nonexistent chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.getChat(OID_3.toString(), OID_1.toString())).rejects.toThrow(ChatNotFoundError);
        });
    });

    describe("addMemberToChat method", () => {
        test("adds a member to a chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const response = await service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
            expect(response).toBe(true);
        });

        test("rejects unauthorized user", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.addMemberToChat(chat._id.toString(), createdUser._id.toString(), createdUser._id.toString())).rejects.toThrow(UnauthorizedError);
        });

        test("rejects nonexistent user", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.addMemberToChat(chat._id.toString(), OID_1.toString(), OID_3._id.toString())).rejects.toThrow(UserNotFoundError);
        });

        test("rejects nonexistent chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.addMemberToChat(OID_3.toString(), createdUser._id.toString(), createdUser._id.toString())).rejects.toThrow(ChatNotFoundError);
        });

        test("reject owner of chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.addMemberToChat(chat._id.toString(), createdUser._id.toString(), createdUser._id._id.toString())).rejects.toThrow(UserOwnsChatError);
        });

        test("reject already in chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
            await expect(service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString())).rejects.toThrow(UserAlreadyInChatError);
        });
    });
    
    describe("removeMemberFromChat method", () => {
        test("removes a member from a chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await service.addMemberToChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
            const response = await service.removeMemberFromChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString());
            expect(response).toBe(true);
        });

        test("rejects unauthorized user", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.removeMemberFromChat(chat._id.toString(), createdUser._id.toString(), createdUser._id.toString())).rejects.toThrow(UnauthorizedError);
        });

        test("rejects nonexistent user", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.removeMemberFromChat(chat._id.toString(), OID_1.toString(), OID_3._id.toString())).rejects.toThrow(UserNotFoundError);
        });

        test("rejects nonexistent chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.removeMemberFromChat(OID_3.toString(), createdUser._id.toString(), createdUser._id.toString())).rejects.toThrow(ChatNotFoundError);
        });

        test("reject owner of chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.removeMemberFromChat(chat._id.toString(), createdUser._id.toString(), createdUser._id._id.toString())).rejects.toThrow(UserOwnsChatError);
        });

        test("reject not in chat", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.removeMemberFromChat(chat._id.toString(), OID_1.toString(), createdUser._id.toString())).rejects.toThrow(UserNotInChatError);
        });
    });

    describe("updateChatInformation method", () => {
        test("updates chat information", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            // update
            await service.updateChatInformation(chat._id.toString(), chat.owner.toString(), {
                title: "Test"
            });
            const updated = await repository.findChatById(chat._id.toString());
            expect(updated?.title).toBe("Test");
        });

        test("rejects unauthorized", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            // update
            await expect(service.updateChatInformation(chat._id.toString(), OID_3.toString(), {
                title: "Test"
            })).rejects.toThrow(UnauthorizedError);
        });

        test("rejects nonexistent chat", async () => {
            await expect(service.updateChatInformation(OID_1._id.toString(), OID_3.toString(), {
                title: "Test"
            })).rejects.toThrow(ChatNotFoundError);
        });
    });

    describe("sendMessage method", () => {
        test("sends a message", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "Hello",
            });
            expect(message.chat.toString()).toStrictEqual(chat._id.toString());
            expect(message.textContent).toBe("Hello");
        });

        test("rejects nonexistent chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.sendMessage(OID_1.toString(), createdUser._id.toString(), {
                textContent: "Hello",
            })).rejects.toThrow(ChatNotFoundError);
        });

        test("rejects unauthorized", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const user2 = await users.create({
                ...GENERIC_USER_CREATION_DTO,
                email: "example99@example.com",
            });
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.sendMessage(chat._id.toString(), user2._id.toString(), {
                textContent: "Hello2",
            })).rejects.toThrow(UnauthorizedError);
        });
    });

    describe("uploadImage method", () => {
        test("uploads an image", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "Hello",
            });
            const image = await service.uploadImage(message._id.toString(), createdUser._id.toString(), {
                uri: "test",
            });
            expect(image.message.toString()).toBe(message._id.toString());
            expect(image.uri).toBe("test");
        });

        test("rejects unauthorized (not owner of message)", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const createdUser2 = await users.create({
                ...GENERIC_USER_CREATION_DTO,
                email: "example99@example.com",
            });
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "Hello",
            });
            await expect(service.uploadImage(message._id.toString(), createdUser2._id.toString(), {
                uri: "test",
            })).rejects.toThrow(UnauthorizedError);
        });

        test("rejects nonexistent message", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            await expect(service.uploadImage(OID_1.toString(), createdUser._id.toString(), {
                uri: "test",
            })).rejects.toThrow(MessageNotFoundError);
        });
    });

    describe("getImage method", () => {
        test("gets an image", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "hello",
            });
            const image = await service.uploadImage(message._id.toString(), createdUser._id.toString(), {
                uri: "test",
            });
            const found = await service.getImage(image._id.toString(), createdUser._id.toString());
            expect(found._id.toString()).toBe(image._id.toString());
        });

        test("rejects nonexistent image", async () => {
            await expect(service.getImage(OID_1.toString(), OID_2.toString())).rejects.toThrow(ImageNotFoundError);
        });

        test("allows other user in chat", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const createdUser2 = await users.create({
                ...GENERIC_USER_CREATION_DTO,
                email: "example99@example.com",
            });
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            await service.addMemberToChat(chat._id.toString(), createdUser._id.toString(), createdUser2._id.toString());
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "hello",
            });
            const image = await service.uploadImage(message._id.toString(), createdUser._id.toString(), {
                uri: "test",
            });
            const found = await service.getImage(image._id.toString(), createdUser2._id.toString());
            expect(found._id.toString()).toBe(image._id.toString());
        });

        test("rejects unauthorized (user not in chat)", async () => {
            const createdUser = await users.create(GENERIC_USER_CREATION_DTO);
            const createdUser2 = await users.create({
                ...GENERIC_USER_CREATION_DTO,
                email: "example99@example.com",
            });
            const chat = await service.createChat(createdUser._id.toString(), GENERIC_CHAT_CREATION_DTO);
            const message = await service.sendMessage(chat._id.toString(), createdUser._id.toString(), {
                textContent: "hello",
            });
            const image = await service.uploadImage(message._id.toString(), createdUser._id.toString(), {
                uri: "test",
            });
            await expect(service.getImage(image._id.toString(), createdUser2._id.toString())).rejects.toThrow(UnauthorizedError);
        });
    });

    describe("getMessages method", () => {
        test("gets paginated messages at correct locations", async () => {
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
        });

        test("rejects chat does not exist", async () => {
            await expect(service.getMessages(OID_1.toString(), OID_1.toString())).rejects.toThrow(ChatNotFoundError);
        });

        test("rejects unauthorized (not in chat)", async () => {
            const chat = await service.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
            await expect(service.getMessages(chat._id.toString(), OID_3.toString())).rejects.toThrow(UnauthorizedError);
        });
    });
});
