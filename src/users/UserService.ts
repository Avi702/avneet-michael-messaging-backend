import { UnauthorizedError } from "../shared/errors/common";
import { UserAlreadyExistsError, UserNotFoundError } from "../shared/errors/users";
import type { CreateUserDto } from "./dto/CreateUserDto";
import type { UpdateProfileDto } from "./dto/UpdateProfileDto";
import type { PublicUser, User } from "./User.types";
import { UserAction, UserAuthorizationService } from "./UserAuthorizationService";
import type { UserRepository } from "./UserRepository";

export class UserService {
    constructor(private readonly users: UserRepository, private readonly authorization: UserAuthorizationService) {}

    // Minimum age for any user
    public static readonly MINIMUM_AGE = 18;

    /**
     * Checks whether a birth date is valid
     * @param birthDate The birth date in YYYY-MM-DD format
     * @returns Whether the user is at least MINIMUM_AGE
     * 
     * today is for debug only; sets the current date for reproducibility
     */
    public birthDateIsValid(birthDate: string, today: Date = new Date()): boolean {
        today.setUTCHours(0, 0, 0, 0);
        const [year, month, day] = birthDate.split("-").map(Number);
        if (!year || !month || !day) {
            throw new Error(`Invalid date: YEAR:${year}, MONTH:${month}, DAY:${day}`);
        }
        const userBirthDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const youngestBirthDateAllowed = new Date(today.getTime());
        youngestBirthDateAllowed.setUTCFullYear(today.getUTCFullYear() - UserService.MINIMUM_AGE);
        return userBirthDate <= youngestBirthDateAllowed;
    }

    /**
     * Gets a user by ID, including all information
     * @param id The ID of the user
     * @returns The User
     * @throws Error if user does not exist
     */
    private async getPrivateUser(id: string): Promise<User> {
        const user = await this.users.findById(id);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    /**
     * Returns the public (client safe) user object for a given user ID
     * @param userId The ID of the user to get
     * @param actorId The ID of the user who is doing the getting
     * @returns The PublicUser
     * @throws Error if action is not authorized
     */
    public async getUser(userId: string, actorId: string): Promise<PublicUser> {
        if (!(await this.authorization.authorizeAction(userId, actorId, UserAction.Get))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.getPrivateUser(userId);
        return this.users.publicizeUser(user);
    }

    /**
     * Creates a user
     * @internal DO NOT USE THIS METHOD. Intended to be called by AuthenticationService; this writes a raw password.
     * @param data The DTO for creating a user
     * @returns A new user
     * @throws Error if user is not at least MINIMUM_AGE years old
     * @throws Error if user already exists with that email
     */
    public async createUser(data: CreateUserDto): Promise<PublicUser> {
        if (!this.birthDateIsValid(data.birthDate)) {
            throw new Error(`User is not old enough! Birth date ${data.birthDate} is not at least ${UserService.MINIMUM_AGE} years ago`);
        }
        const isExistingUser = await this.users.existsByEmail(data.email);
        if (isExistingUser) {
            throw new UserAlreadyExistsError(data.email);
        }
        return this.users.publicizeUser(await this.users.create(data));
    }

    /**
     * Updates a user's profile
     * @param userId The ID of the user being updated
     * @param actorId The ID of the user doing the updating
     * @param data The DTO for updating a profile
     * @throws Error if user does not exist
     * @throws Error if action not authorized
     */
    public async updateProfile(userId: string, actorId: string, data: UpdateProfileDto): Promise<void> {
        if (!(await this.authorization.authorizeAction(userId, actorId, UserAction.Update))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.users.updateProfile(userId, data);
        if (!user) {
            throw new UserNotFoundError(userId);
        }
    }
}
