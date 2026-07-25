import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MessagingRepository } from "../MessagingRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { MessagingAction, MessagingAuthorizationService } from "../MessagingAuthorizationService";
import { Chat } from "../Chat.types";
import { Message } from "../Message.types";

const OID_1 = new mongoose.Types.ObjectId("ffffffffffffffffffffffff");
const OID_2 = new mongoose.Types.ObjectId("efffffffffffffffffffffff");
const OID_3 = new mongoose.Types.ObjectId("dfffffffffffffffffffffff");

const GENERIC_CHAT_CREATION_DTO = {
    title: "Hello",
    members: [OID_2],
};

describe("MessagingRepository", () => {
    let mongo: MongoMemoryServer;
    let repository: MessagingRepository;
    let authorization: MessagingAuthorizationService;
    let chat: Chat;
    let message: Message;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new MessagingRepository();
        authorization = new MessagingAuthorizationService(repository);
        chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        await repository.addMemberToChat(chat._id.toString(), OID_2.toString());
        message = await repository.sendMessage(chat._id.toString(), OID_2.toString(), {
            textContent: "hello"
        });
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    describe("member-locked actions", () => {
        describe("MessagingAction.GetChat", () => {
            test("accepts user owns chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetChat)).toBe(true);
            });

            test("accepts user member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetChat)).toBe(true);
            });

            test("rejects user not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetChat)).toBe(false);
            });
        });

        describe("MessagingAction.SendMessage", () => {
            test("accepts user owns chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.SendMessage)).toBe(true);
            });

            test("accepts user member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.SendMessage)).toBe(true);
            });

            test("rejects user not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.SendMessage)).toBe(false);
            });
        });

        describe("MessagingAction.GetImage", () => {
            test("accepts user owns chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetImage)).toBe(true);
            });

            test("accepts user member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetImage)).toBe(true);
            });

            test("rejects user not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetImage)).toBe(false);
            });
        });

        describe("MessagingAction.GetMessages", () => {
            test("accepts user owns chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetMessages)).toBe(true);
            });

            test("accepts user member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetMessages)).toBe(true);
            });

            test("rejects user not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetMessages)).toBe(false);
            });
        });
    });

    describe("owner-locked actions", () => {
        describe("MessagingAction.AddMember", () => {
            test("accepts owner of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.AddMember)).toBe(true);
            });

            test("rejects member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.AddMember)).toBe(false);
            });

            test("rejects not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.AddMember)).toBe(false);
            });
        });

        describe("MessagingAction.RemoveMember", () => {
            test("accepts owner of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.RemoveMember)).toBe(true);
            });

            test("rejects member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.RemoveMember)).toBe(false);
            });

            test("rejects not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.RemoveMember)).toBe(false);
            });
        });

        describe("MessagingAction.UpdateInformation", () => {
            test("accepts owner of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.UpdateInformation)).toBe(true);
            });

            test("rejects member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.UpdateInformation)).toBe(false);
            });

            test("rejects not member of chat", async () => {
                expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.UpdateInformation)).toBe(false);
            });
        });

        describe("MessagingAction.UploadImage", () => {
            test("accepts owner of message", async () => {
                expect(await authorization.authorizeAction(message._id.toString(), OID_2.toString(), MessagingAction.UploadImage)).toBe(true);
            });

            test("rejects not owner of message but in chat", async () => {
                expect(await authorization.authorizeAction(message._id.toString(), OID_1.toString(), MessagingAction.UploadImage)).toBe(false);
            });

            test("rejects not owner of message and not in chat", async () => {
                expect(await authorization.authorizeAction(message._id.toString(), OID_3.toString(), MessagingAction.UploadImage)).toBe(false);
            });
        });
    });
});
