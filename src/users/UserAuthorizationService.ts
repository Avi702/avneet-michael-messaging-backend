import { UserRepository } from "./UserRepository";

export const UserAction = {
    GetById: "GET_BY_ID", // Get the public user. Private user gets are only for internal use
    GetByEmail: "GET_BY_EMAIL",
    Search: "SEARCH", // Search for users by display name
    Update: "UPDATE", // Update the user's profile information
} as const;

export type UserActionType = typeof UserAction[keyof typeof UserAction];

export class UserAuthorizationService {
    constructor(private readonly users: UserRepository) {}

    /**
     * Checks whether an action is allowed
     * @param userId The ID of the user on whom the action is operating
     * @param actorId The ID of the user performing the action
     * @param action The action being performed
     * @returns Promise for boolean: true if allowed, false if disallowed
     */
    public async authorizeAction(userId: string, actorId: string, action: UserActionType): Promise<boolean> {
        if (action === UserAction.GetById || action === UserAction.GetByEmail || action === UserAction.Search) {
            return true;
        }
        if (action == UserAction.Update) {
            return userId === actorId;
        }
        // Invalid action
        throw new Error(`Invalid action ${action}`);
    }
}