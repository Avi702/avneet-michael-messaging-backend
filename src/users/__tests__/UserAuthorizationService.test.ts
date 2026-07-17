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

    describe("UserAction.Get", () => {
        // No need for more tests, gating for get user methods is always by authentication only
        test("always allows get", async () => {
            expect(await authorization.authorizeAction("", "", UserAction.Get)).toBe(true);
        });
    });

    describe("UserAction.Update", () => {
        test("allows actor to update self", async () => {
            expect(await authorization.authorizeAction("abc", "abc", UserAction.Update)).toBe(true);
        });

        test("prevents actor from updating others", async () => {
            expect(await authorization.authorizeAction("abc", "abb", UserAction.Update)).toBe(false);
        });
    });
});
