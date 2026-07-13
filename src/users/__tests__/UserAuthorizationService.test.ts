import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { UserService } from "../UserService";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { UserRepository } from "../UserRepository";
import { UserAction, UserAuthorizationService } from "../UserAuthorizationService";

describe("UserAuthorizationService", () => {
    // Initialize the configurations
    let mongo: MongoMemoryServer;
    let repository: UserRepository;
    let authorization: UserAuthorizationService;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new UserRepository();
        authorization = new UserAuthorizationService(repository);
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    // Clear everything between tests
    beforeEach(async () => {
        await mongoose.connection.collection("users").deleteMany({});
    });

    test("authorizes get actions", async () => {
        expect(await authorization.authorizeAction("", "", UserAction.Get)).toBe(true);
    });

    test("authorizes update actions", async () => {
        expect(await authorization.authorizeAction("abc", "abc", UserAction.Update)).toBe(true);
        expect(await authorization.authorizeAction("abc", "abb", UserAction.Update)).toBe(false);
    });
});
