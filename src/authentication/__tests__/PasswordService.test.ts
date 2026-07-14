import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { PasswordService } from "../PasswordService";

describe("PasswordService", () => {
    test("hashes and verifies passwords", async () => {
        const service = new PasswordService();
        const password = "hello world";
        const hash = await service.hash(password);
        const isValid = await service.compare(password, hash);
        expect(isValid).toBe(true);
        const notValid = await service.compare("dog", hash);
        expect(notValid).toBe(false);
    });
});
