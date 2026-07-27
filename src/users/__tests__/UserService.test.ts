import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { UserService } from "../UserService";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { UserRepository } from "../UserRepository";
import { UserAuthorizationService } from "../UserAuthorizationService";
import { UserAlreadyExistsError, UserNotFoundError } from "../../shared/errors/users";

describe("UserService", () => {
    // Initialize the configurations
    let mongo: MongoMemoryServer;
    let repository: UserRepository;
    let authorization: UserAuthorizationService;
    let service: UserService;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new UserRepository();
        authorization = new UserAuthorizationService(repository);
        service = new UserService(repository, authorization);
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    // Clear everything between tests
    beforeEach(async () => {
        await mongoose.connection.collection("users").deleteMany({});
    });

    const GENERIC_USER_CREATION_DTO = {
        displayName: "John Doe",
        birthDate: "2000-01-01",
        email: "johndoe@example.com",
        password: "password",
    };

    const OID_1 = new mongoose.Types.ObjectId("ffffffffffffffffffffffff");

    describe("birthDateIsValid", () => {
        test("identivies valid birth dates", () => {
            expect(service.birthDateIsValid("1990-02-04", new Date("2008-02-04"))).toBe(true);
            expect(service.birthDateIsValid("1990-02-04", new Date("2008-02-05"))).toBe(true);
            expect(service.birthDateIsValid("1990-02-04", new Date("2009-02-04"))).toBe(true);
        });

        test("identifies invalid birth dates", () => {
            expect(service.birthDateIsValid("1990-02-04", new Date("2007-02-05"))).toBe(false);
            expect(service.birthDateIsValid("1990-02-04", new Date("2008-01-05"))).toBe(false);
        });
    });

    describe("getUserById method", () => {
        test("gets a user by ID", async () => {
            // Create the user
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            // Get the user
            const found = await service.getUserById(user._id.toString(), "");
            expect(found._id).toStrictEqual(user._id);
        });

        test("rejects nonexistent user", async () => {
            await expect(service.getUserById(OID_1.toString(), OID_1.toString())).rejects.toThrow(UserNotFoundError);
        });

        test("only includes public data", async () => {
            // Create the user
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            // Get the user
            const publicUser = await service.getUserById(user._id.toString(), "");
            expect(publicUser._id).toStrictEqual(user._id);
            expect(publicUser.displayName).toBe("John Doe");
            expect((publicUser as any).password).toBe(undefined);
            expect((publicUser as any).email).toBe(undefined);
            expect((publicUser as any).birthDate).toBe(undefined);
        });
    });

    describe("getUserByEmail method", () => {
        test("gets a user by email", async () => {
            // Create the user
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            // Get the user
            const found = await service.getUserByEmail(GENERIC_USER_CREATION_DTO.email, "");
            expect(found._id).toStrictEqual(user._id);
        });

        test("rejects nonexistent user", async () => {
            await expect(service.getUserByEmail("nomail", OID_1.toString())).rejects.toThrow(UserNotFoundError);
        });

        test("only includes public data", async () => {
            // Create the user
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            // Get the user
            const publicUser = await service.getUserByEmail(GENERIC_USER_CREATION_DTO.email, "");
            expect(publicUser._id).toStrictEqual(user._id);
            expect(publicUser.displayName).toBe("John Doe");
            expect((publicUser as any).password).toBe(undefined);
            expect((publicUser as any).email).toBe(undefined);
            expect((publicUser as any).birthDate).toBe(undefined);
        });
    });

    describe("searchUsers method", () => {
        test("finds users by partial, case insensitive display name", async () => {
            await service.createUser({ displayName: "Alice Smith", birthDate: "2000-01-01", email: "alice@example.com", password: "password" });
            await service.createUser({ displayName: "Bob Jones", birthDate: "2000-01-01", email: "bob@example.com", password: "password" });
            const results = await service.searchUsers("ALI", OID_1.toString());
            expect(results.length).toBe(1);
            expect(results[0]?.displayName).toBe("Alice Smith");
        });

        test("excludes the searcher from the results", async () => {
            const me = await service.createUser({ displayName: "Alice Smith", birthDate: "2000-01-01", email: "alice@example.com", password: "password" });
            const results = await service.searchUsers("alice", me._id.toString());
            expect(results.length).toBe(0);
        });

        test("only includes public data", async () => {
            await service.createUser(GENERIC_USER_CREATION_DTO);
            const results = await service.searchUsers("john", OID_1.toString());
            expect(results.length).toBe(1);
            expect((results[0] as any).password).toBe(undefined);
            expect((results[0] as any).email).toBe(undefined);
        });
    });

    describe("createUser method", () => {
        test("creates new user", async () => {
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            expect(user.displayName).toBe("John Doe");
        });

        test("rejects duplicate user", async () => {
            await service.createUser(GENERIC_USER_CREATION_DTO);
            await expect(service.createUser(GENERIC_USER_CREATION_DTO)).rejects.toThrow(UserAlreadyExistsError);
        });
    });

    describe("updateProfile method", () => {
        test("updates a user's profile", async () => {
            // Create the user
            const user = await service.createUser(GENERIC_USER_CREATION_DTO);
            // Update the user's profile
            await service.updateProfile(user._id.toString(),  {
                displayName: "Bob Doe",
            });
            // Get the user again
            const updated = await service.getUserById(user._id.toString(), "");
            // Check the update
            expect(updated?.displayName).toBe("Bob Doe");
        });
    });
});
