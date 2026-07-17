import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { beforeAll, afterAll, describe, beforeEach, test, expect, jest } from "@jest/globals";
import { AuthenticationService } from "../AuthenticationService";
import { UserRepository } from "../../users/UserRepository";
import { UserService } from "../../users/UserService";
import { UserAuthorizationService } from "../../users/UserAuthorizationService";
import { PasswordService } from "../PasswordService";
import { JwtService } from "../JwtService";

jest.mock("../../config/environment", () => {
    const originalModule = jest.requireActual("../../config/environment") as any;
    return {
        __esModule: true,
        ...originalModule,
        VARIABLES: {
            env: "test",
            jwtAccessSecret: "test_key",
            jwtRefreshSecret: "test_key_2",
            jwtAccessTokenLifetime: "15m",
            jwtRefreshTokenLifetime: "7d",
        },
    };
});

describe("AuthenticationService", () => {
    let mongo: MongoMemoryServer;
    let userRepository: UserRepository;
    let userAuthorization: UserAuthorizationService;
    let userService: UserService;
    let passwordService: PasswordService;
    let jwtService: JwtService;
    let authenticationService: AuthenticationService;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        userRepository = new UserRepository();
        userAuthorization = new UserAuthorizationService(userRepository);
        userService = new UserService(userRepository, userAuthorization);
        passwordService = new PasswordService();
        jwtService = new JwtService();
        authenticationService = new AuthenticationService(userRepository, userService, passwordService, jwtService);
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    beforeEach(async () => {
        await mongoose.connection.db?.dropDatabase();
    });

    const GENERIC_USER_CREATION_DTO = {
        displayName: "John Doe",
        birthDate: "2000-01-01",
        email: "johndoe@example.com",
        password: "password",
    };

    describe("register method", () => {
        test("registers a new user", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            expect(user.displayName).toBe(GENERIC_USER_CREATION_DTO.displayName);
        });
    });

    describe("login method", () => {
        test("logs in a registered user", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            const loggedIn = await authenticationService.login(GENERIC_USER_CREATION_DTO.email, GENERIC_USER_CREATION_DTO.password);
            expect(loggedIn.user._id.toString()).toBe(user._id.toString());
        });

        test("does not log in a nonexistent user", async () => {
            await expect(authenticationService.login("none", "none")).rejects.toThrow();
        });

        test("does not log in with incorrect password", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            await expect(authenticationService.login(GENERIC_USER_CREATION_DTO.email, "wrong")).rejects.toThrow();
        });
    });

    describe("authenticate method", () => {
        test("authenticates with an access token", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            const loggedIn = await authenticationService.login(GENERIC_USER_CREATION_DTO.email, GENERIC_USER_CREATION_DTO.password);
            const authentication = await authenticationService.authenticate(loggedIn.accessToken);
            expect(authentication._id.toString()).toBe(user._id.toString());
        });

        test("rejects invalid token", async () => {
            await expect(authenticationService.authenticate("dog")).rejects.toThrow();
        });
    });

    describe("refresh method", () => {
        test("refreshes a valid token", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            const loggedIn = await authenticationService.login(GENERIC_USER_CREATION_DTO.email, GENERIC_USER_CREATION_DTO.password);
            const newTokens = await authenticationService.refresh(loggedIn.refreshToken);
            const authentication = await authenticationService.authenticate(newTokens.accessToken);
            expect(authentication._id.toString()).toBe(user._id.toString());
        });

        test("rejects invalid token", async () => {
            await expect(authenticationService.refresh("123")).rejects.toThrow();
        });
    });

    describe("updatePassword method", () => {
        test("updates a password", async () => {
            const user = await authenticationService.register(GENERIC_USER_CREATION_DTO);
            const loggedIn = await authenticationService.login(GENERIC_USER_CREATION_DTO.email, GENERIC_USER_CREATION_DTO.password);
            expect(loggedIn.user._id.toString()).toBe(user._id.toString());
            await authenticationService.updatePassword(user._id.toString(), "helloworld");
            // expect old password to fail
            await expect(authenticationService.login(GENERIC_USER_CREATION_DTO.email, GENERIC_USER_CREATION_DTO.password)).rejects.toThrow();
            // expect new password to succeed
            const newLoggedIn = await authenticationService.login(GENERIC_USER_CREATION_DTO.email, "helloworld");
            expect(newLoggedIn.user._id.toString()).toBe(user._id.toString());
        });
    });
});
