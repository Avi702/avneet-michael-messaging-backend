import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { UserRepository } from "../UserRepository";

import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";

describe("UserRepository", () => {
    // Initialize the configurations
    let mongo: MongoMemoryServer;
    let repository: UserRepository;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        repository = new UserRepository();
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

    describe("create method", () => {
        test("creates a new user", async () => {
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            expect(user.displayName).toBe("John Doe");
            expect(user.birthDate).toBe("2000-01-01");
            expect(user.email).toBe("johndoe@example.com");
            expect(user.password).toBe("password");
        });
    });

    describe("findById method", () => {
        test("finds a user by ID", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Find it
            const found = await repository.findById(user._id.toString());
            expect(found?._id).toStrictEqual(user._id);
        });

        test("returns null for nonexistent user", async () => {
            const found = await repository.findById(OID_1.toString());
            expect(found).toBe(null);
        });
    });

    describe("findByEmail method", () => {
        test("finds a user by email", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Find it
            const found = await repository.findByEmail(GENERIC_USER_CREATION_DTO.email);
            expect(found?._id).toStrictEqual(user._id);
        });

        test("returns null for nonexistent user", async () => {
            const found = await repository.findById(OID_1.toString());
            expect(found).toBe(null);
        });
    });

    describe("existsByEmail method", () => {
        test("returns true if user with email exists", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Ensure the email appears as taken
            expect(await repository.existsByEmail(user.email)).toBe(true);
        });

        test("returns false if user with email does not exist", async () => {
            expect(await repository.existsByEmail("johndoe@example.com")).toBe(false);
        });
    });

    describe("updateProfile method", () => {
        test("updates a profile", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Update the user's profile
            await repository.updateProfile(user._id.toString(), {
                displayName: "Bob Doe",
            });
            // Get the user again
            const updated = await repository.findById(user._id.toString());
            // Check the update
            expect(updated?.displayName).toBe("Bob Doe");
        });
    });

    describe("setOnline method", () => {
        test("sets whether a user is online", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Mark the user online
            await repository.setOnline(user._id.toString(), false);
            // Get the user again
            const updated = await repository.findById(user._id.toString());
            // Check the update
            expect(updated?.isOnline).toBe(false);
        });
    });

    describe("delete method", () => {
        test("deletes a user", async () => {
            // Create the user
            const user = await repository.create(GENERIC_USER_CREATION_DTO);
            // Delete the user
            await repository.delete(user._id.toString());
            // Ensure the user is gone
            expect(await repository.findById(user._id.toString())).toBe(null);
        });
    });
});
