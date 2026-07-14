import { beforeAll, afterAll, describe, beforeEach, test, expect } from "@jest/globals";
import { addMemberToChatSchema, createChatSchema, getChatSchema, getImageSchema, removeMemberFromChatSchema, updateChatInformationSchema, uploadImageSchema } from "../messaging";

describe("messaging validator", () => {
    describe("createChatSchema", () => {
        test("accepts valid input", () => {
            expect(createChatSchema.safeParse({
                title: "my chat"
            }).success).toBe(true);
        });
    
        test("rejects bad data type", () => {
            expect(createChatSchema.safeParse({
                title: 3
            }).success).toBe(false);
        });
    
        test("rejects missing field", () => {
            expect(createChatSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad title", () => {
            expect(createChatSchema.safeParse({
                title: "my"
            }).success).toBe(false);
            expect(createChatSchema.safeParse({
                title: "mymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymymy"
            }).success).toBe(false);
        });
    });
    
    describe("getChatSchema", () => {
        test("accepts valid input", () => {
            expect(getChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(getChatSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects wrong data type", () => {
            expect(getChatSchema.safeParse({
                chatId: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad id", () => {
            expect(getChatSchema.safeParse({
                chatId: "fjioewjfoi",
            }).success).toBe(false);
        });
    });
    
    describe("addMemberToChatSchema", () => {
        test("accepts valid input", () => {
            expect(addMemberToChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(addMemberToChatSchema.safeParse({
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(addMemberToChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(addMemberToChatSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects wrong data type", () => {
            expect(addMemberToChatSchema.safeParse({
                chatId: 3,
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(addMemberToChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad id", () => {
            expect(addMemberToChatSchema.safeParse({
                chatId: "fjioewjfoi",
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(addMemberToChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: "fjioewjfoi",
            }).success).toBe(false);
            expect(addMemberToChatSchema.safeParse({
                chatId: "fjioewjfoi",
                userId: "fjioewjfoi",
            }).success).toBe(false);
        });
    });
    
    describe("removeMemberFromChatSchema", () => {
        test("accepts valid input", () => {
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(removeMemberFromChatSchema.safeParse({
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(removeMemberFromChatSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects wrong data type", () => {
            expect(removeMemberFromChatSchema.safeParse({
                chatId: 3,
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad id", () => {
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "fjioewjfoi",
                userId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                userId: "fjioewjfoi",
            }).success).toBe(false);
            expect(removeMemberFromChatSchema.safeParse({
                chatId: "fjioewjfoi",
                userId: "fjioewjfoi",
            }).success).toBe(false);
        });
    });
    
    describe("updateChatInformationSchema", () => {
        test("accepts valid input", () => {
            expect(updateChatInformationSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                title: "Hello World"
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(updateChatInformationSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                title: "Hello World"
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects bad data type", () => {
            expect(updateChatInformationSchema.safeParse({
                chatId: 3,
                title: "Hello World"
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                title: 3,
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                chatId: 3,
                title: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad format", () => {
            expect(updateChatInformationSchema.safeParse({
                chatId: "wejfiowe",
                title: "Hello World"
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                title: "he"
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                chatId: "507f1f77bcf86cd799439011",
                title: "hehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehe"
            }).success).toBe(false);
            expect(updateChatInformationSchema.safeParse({
                chatId: "qwerty",
                title: "hehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehehe"
            }).success).toBe(false);
        });
    });
    
    describe("uploadImageSchema", () => {
        test("accepts valid input", () => {
            expect(uploadImageSchema.safeParse({
                messageId: "507f1f77bcf86cd799439011",
                uri: "test",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(uploadImageSchema.safeParse({
                messageId: "507f1f77bcf86cd799439011",
            }).success).toBe(false);
            expect(uploadImageSchema.safeParse({
                uri: "test",
            }).success).toBe(false);
            expect(uploadImageSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects wrong type", () => {
            expect(uploadImageSchema.safeParse({
                messageId: 3,
                uri: "test",
            }).success).toBe(false);
            expect(uploadImageSchema.safeParse({
                messageId: "507f1f77bcf86cd799439011",
                uri: 3,
            }).success).toBe(false);
            expect(uploadImageSchema.safeParse({
                messageId: 3,
                uri: 3,
            }).success).toBe(false);
        });
        
        test("rejects bad object ID", () => {
            expect(uploadImageSchema.safeParse({
                messageId: "jwo",
                uri: "test",
            }).success).toBe(false);
        });
    });
    
    describe("getImageSchema", () => {
        test("accepts valid input", () => {
            expect(getImageSchema.safeParse({
                imageId: "507f1f77bcf86cd799439011",
            }).success).toBe(true);
        });
    
        test("rejects missing field", () => {
            expect(getImageSchema.safeParse({
            }).success).toBe(false);
        });
    
        test("rejects wrong data type", () => {
            expect(getImageSchema.safeParse({
                imageId: 3,
            }).success).toBe(false);
        });
    
        test("rejects bad id", () => {
            expect(getImageSchema.safeParse({
                imageId: "fjioewjfoi",
            }).success).toBe(false);
        });
    });
});
