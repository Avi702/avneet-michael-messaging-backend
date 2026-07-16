import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MessagingRepository } from "../MessagingRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { MessagingAction, MessagingAuthorizationService } from "../MessagingAuthorizationService";

describe("MessagingRepository", () => {
    let mongo: MongoMemoryServer;
    let repository: MessagingRepository;
    let authorization: MessagingAuthorizationService;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new MessagingRepository();
        authorization = new MessagingAuthorizationService(repository);
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

    test("authorizes member-locked actions", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        await repository.addMemberToChat(chat._id.toString(), OID_2.toString());

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetChat)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetChat)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetChat)).toBe(false);

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.SendMessage)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.SendMessage)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.SendMessage)).toBe(false);

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetImage)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetImage)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetImage)).toBe(false);

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.GetMessages)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.GetMessages)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.GetMessages)).toBe(false);
    });

    test("authorizes owner-locked actions", async () => {
        const chat = await repository.createChat(OID_1.toString(), GENERIC_CHAT_CREATION_DTO);
        await repository.addMemberToChat(chat._id.toString(), OID_2.toString());
        const message = await repository.sendMessage(chat._id.toString(), OID_2.toString(), {
            textContent: "hello"
        });

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.AddMember)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.AddMember)).toBe(false);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.AddMember)).toBe(false);

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.RemoveMember)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.RemoveMember)).toBe(false);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.RemoveMember)).toBe(false);

        expect(await authorization.authorizeAction(chat._id.toString(), OID_1.toString(), MessagingAction.UpdateInformation)).toBe(true);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_2.toString(), MessagingAction.UpdateInformation)).toBe(false);
        expect(await authorization.authorizeAction(chat._id.toString(), OID_3.toString(), MessagingAction.UpdateInformation)).toBe(false);

        expect(await authorization.authorizeAction(message._id.toString(), OID_1.toString(), MessagingAction.UploadImage)).toBe(false);
        expect(await authorization.authorizeAction(message._id.toString(), OID_2.toString(), MessagingAction.UploadImage)).toBe(true);
        expect(await authorization.authorizeAction(message._id.toString(), OID_3.toString(), MessagingAction.UploadImage)).toBe(false);
    });
});
