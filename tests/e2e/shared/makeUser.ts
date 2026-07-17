import { LoginResult } from "../../../src/authentication/AuthenticationService";
import { makeRequest } from "./makeRequest";

// Generates unique example credentials sequentially to avoid collisions during testing
let testCredentialsCount = 0;
const exampleCredentials = {
    email: "example@example.com",
    password: "password",
};
const exampleRegistration = {
    ...exampleCredentials,
    birthDate: "2000-01-01",
    displayName: "John Doe",
};
export function createTestRegistration() {
    testCredentialsCount = testCredentialsCount + 1;
    return {
        ...exampleRegistration,
        email: `example${testCredentialsCount}@example.com`,
    };
}
export function extractCredentials(registration: any): any {
    return {
        email: registration.email,
        password: registration.password,
    };
}

/**
 * Creates a new user
 * 
 * For use when not testing authentication. Shortcut to create a new user and extract the tokens
 * 
 * @param baseUrl The server's base URL
 * @returns The user information; LoginResult
 */
export async function makeUser(baseUrl: string): Promise<LoginResult> {
    const registration = createTestRegistration();
    const credentials = extractCredentials(registration);
    // Make a user
    await makeRequest(baseUrl, "authentication/register", {
        ...registration,
    });
    // Login and get the token
    const loginResult = await makeRequest(baseUrl, "authentication/login", {
        ...credentials,
    });
    const loginJson = await loginResult.json();
    return loginJson;
}


