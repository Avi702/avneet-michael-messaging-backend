import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { UserService } from "../UserService";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { UserRepository } from "../UserRepository";

describe("UserService", () => {
    // Initialize the configurations
    let mongo: MongoMemoryServer;
    let repository: UserRepository;
    let service: UserService;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new UserRepository();
        service = new UserService(repository);
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

    test("identifies valid and invalid birthdates", () => {
        expect(service.birthDateIsValid("1990-02-04", new Date("2008-02-04"))).toBe(true);
        expect(service.birthDateIsValid("1990-02-04", new Date("2008-02-05"))).toBe(true);
        expect(service.birthDateIsValid("1990-02-04", new Date("2009-02-04"))).toBe(true);
        expect(service.birthDateIsValid("1990-02-04", new Date("2007-02-05"))).toBe(false);
        expect(service.birthDateIsValid("1990-02-04", new Date("2008-01-05"))).toBe(false);
    });

    test("gets a user", async () => {
        // Create the user
        const user = await service.createUser(GENERIC_USER_CREATION_DTO);
        // Get the user
        const found = await service.getUser(user._id.toString());
        expect(found._id).toStrictEqual(user._id);
    });

    test("only shows public data in public get", async () => {
        // Create the user
        const user = await service.createUser(GENERIC_USER_CREATION_DTO);
        // Get the user
        const publicUser = await service.getPublicUser(user._id.toString());
        expect(publicUser._id).toStrictEqual(user._id);
        expect(publicUser.displayName).toBe("John Doe");
        expect((publicUser as any).password).toBe(undefined);
        expect((publicUser as any).email).toBe(undefined);
        expect((publicUser as any).birthDate).toBe(undefined);
    });

    test("fails to duplicate user", async () => {
        // Create a test user
        await service.createUser(GENERIC_USER_CREATION_DTO);
        // Attempt to create another user with the same email
        expect(async () => await service.createUser(GENERIC_USER_CREATION_DTO)).rejects.toThrow();
    });

    test("creates a new user", async () => {
        const user = await service.createUser(GENERIC_USER_CREATION_DTO);
        expect(user.displayName).toBe("John Doe");
        expect(user.birthDate).toBe("2000-01-01");
        expect(user.email).toBe("johndoe@example.com");
        expect(user.password).toBe("password");
    });

    test("updates a user's profile", async () => {
        // Create the user
        const user = await service.createUser(GENERIC_USER_CREATION_DTO);
        // Update the user's profile
        await service.updateProfile(user._id.toString(), {
            displayName: "Bob Doe",
        });
        // Get the user again
        const updated = await service.getUser(user._id.toString());
        // Check the update
        expect(updated?.displayName).toBe("Bob Doe");
    });
});
