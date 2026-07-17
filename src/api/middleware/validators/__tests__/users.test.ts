import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { getUserByEmailSchema, getUserByIdSchema, updateProfileSchema } from "../users";

describe("users validator", () => {
    describe("getUserByIdSchema", () => {
        test("accepts valid input", () => {
            expect(getUserByIdSchema.safeParse({
                userId: "507f1f77bcf86cd799439011"
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(getUserByIdSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad data type", () => {
            expect(getUserByIdSchema.safeParse({
                userId: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad object ID format", () => {
            expect(getUserByIdSchema.safeParse({
                userId: "3",
            }).success).toBe(false);
        });
    });

    describe("getUserByEmailSchema", () => {
        test("accepts valid input", () => {
            expect(getUserByEmailSchema.safeParse({
                email: "example@example.com"
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(getUserByEmailSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad data type", () => {
            expect(getUserByEmailSchema.safeParse({
                email: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad email format", () => {
            expect(getUserByEmailSchema.safeParse({
                email: "example",
            }).success).toBe(false);
        });
    });
    
    describe("updateProfileSchema", () => {
        test("accepts valid input", () => {
            expect(updateProfileSchema.safeParse({
                userId: "507f1f77bcf86cd799439011",
                displayName: "John Doe",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(updateProfileSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad data type", () => {
            expect(updateProfileSchema.safeParse({
                displayName: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad formatting", () => {
            expect(updateProfileSchema.safeParse({
                displayName: "J",
            }).success).toBe(false);
            expect(updateProfileSchema.safeParse({
                displayName: "507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011507f1f77bcf86cd799439011J",
            }).success).toBe(false);
        });
    });    
});
