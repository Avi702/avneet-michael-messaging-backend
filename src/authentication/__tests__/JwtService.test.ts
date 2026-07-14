import { beforeAll, afterAll, describe, beforeEach, test, expect, jest } from "@jest/globals";
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

describe("JwtService", () => {
    let service: JwtService;

    beforeEach(() => {
        service = new JwtService();
    });

    test("creates and verifies access tokens", async () => {
        const userId = "123";
        const token = service.generateAccessToken({ sub: userId });
        const payload = service.verifyAccessToken(token);
        expect(payload.sub).toBe(userId);
    });

    test("creates and verifies refresh tokens", async () => {
        const userId = "123";
        const token = service.generateRefreshToken({ sub: userId });
        const payload = service.verifyRefreshToken(token);
        expect(payload.sub).toBe(userId);
    });
});
