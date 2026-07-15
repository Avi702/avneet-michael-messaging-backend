import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { authenticateSchema, loginSchema, refreshSchema, registerSchema, updatePasswordSchema } from "../authentication";

describe("authentication validator", () => {
    describe("loginSchema", () => {
        test("accepts valid input", () => {
            expect(loginSchema.safeParse({
                email: "test@example.com",
                password: "password",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(loginSchema.safeParse({
                password: "password",
            }).success).toBe(false);
            expect(loginSchema.safeParse({
                email: "test@example.com",
            }).success).toBe(false);
            expect(loginSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects incorrect data type", () => {
            expect(loginSchema.safeParse({
                email: 3,
                password: "password",
            }).success).toBe(false);
            expect(loginSchema.safeParse({
                email: "test@example.com",
                password: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad email", () => {
            expect(loginSchema.safeParse({
                email: "test@example",
                password: "password",
            }).success).toBe(false);
        });
    
        test("rejects bad password length", () => {
            expect(loginSchema.safeParse({
                email: "test@example.com",
                password: "a",
            }).success).toBe(false);
            expect(loginSchema.safeParse({
                email: "test@example.com",
                password: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            }).success).toBe(false);
        })
    });
    
    describe("registerSchema", () => {
        test("accepts valid input", () => {
            expect(registerSchema.safeParse({
                email: "example@example.com",
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(registerSchema.safeParse({
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example.com",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example.com",
                displayName: "Hello",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example.com",
                displayName: "Hello",
                birthDate: "1999-01-01",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad data type", () => {
            expect(registerSchema.safeParse({
                email: 3,
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: 4,
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: 5,
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: 6
            }).success).toBe(false);
        });
    
        test("rejects bad email", () => {
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
        });
    
        test("rejects bad displayName", () => {
            expect(registerSchema.safeParse({
                email: "example@example.com",
                displayName: "He",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example.com",
                displayName: "HelloWorldWorldWorldWorldWorldWOrldWorldHelloWorldWorldWorldWorldWorldWOrldWorldHelloWorldWorldWorldWorldWorldWOrldWorld",
                birthDate: "1999-01-01",
                password: "password",
            }).success).toBe(false);
        });
    
        test("rejects bad bith date", () => {
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "399-01-01",
                password: "password",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "January 1, 1990",
                password: "password",
            }).success).toBe(false);
        });
    
        test("rejects bad password", () => {
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "pa",
            }).success).toBe(false);
            expect(registerSchema.safeParse({
                email: "example@example",
                displayName: "Hello",
                birthDate: "1999-01-01",
                password: "passwordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpasswordpassword",
            }).success).toBe(false);
        });
    });
    
    describe("authenticateSchema", () => {
        test("accepts valid input", () => {
            expect(authenticateSchema.safeParse({
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
            }).success).toBe(true);
        });
    
        test("rejects wrong data type", () => {
            expect(authenticateSchema.safeParse({
                accessToken: 3,
            }).success).toBe(false);
        });
    
        test("rejects missing field", () => {
            expect(authenticateSchema.safeParse({
    
            }).success).toBe(false);
        });
    
        test("rejects bad JWT format", () => {
            expect(authenticateSchema.safeParse({
                accessToken: "catcat-QV30",
            }).success).toBe(false);
        })
    });
    
    describe("refreshSchema", () => {
        test("accepts valid input", () => {
            expect(refreshSchema.safeParse({
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30",
            }).success).toBe(true);
        });
    
        test("rejects wrong data type", () => {
            expect(refreshSchema.safeParse({
                refreshToken: 3,
            }).success).toBe(false);
        });
    
        test("rejects missing field", () => {
            expect(refreshSchema.safeParse({
    
            }).success).toBe(false);
        });
    
        test("rejects bad JWT format", () => {
            expect(refreshSchema.safeParse({
                refreshToken: "catcat-QV30",
            }).success).toBe(false);
        })
    });

    describe("updatePasswordSchema", () => {
        test("accepts valid input", () => {
            expect(updatePasswordSchema.safeParse({
                password: "helloworld",
            }).success).toBe(true);
        });

        test("rejects wrong data type", () => {
            expect(updatePasswordSchema.safeParse({
                password: 3,
            }).success).toBe(false);
        });

        test("rejects missing field", () => {
            expect(updatePasswordSchema.safeParse({
            }).success).toBe(false);
        });

        test("rejects bad input", () => {
            expect(updatePasswordSchema.safeParse({
                password: "a",
            }).success).toBe(false);
            expect(updatePasswordSchema.safeParse({
                password: "helloworldhelloworldhelloworldhelloworldhelloworldhelloworldhelloworldhelloworldhelloworldhelloworldhelloworld",
            }).success).toBe(false);
        });
    });
});
