import { BadRequestError, UnauthorizedError } from "../shared/errors/common";
import { UserAlreadyExistsError, UserNotFoundError, UserNotOldEnoughError } from "../shared/errors/users";
import type { CreateUserDto } from "./dto/CreateUserDto";
import type { UpdateProfileDto } from "./dto/UpdateProfileDto";
import type { PrivateUser, PublicUser, User } from "./User.types";
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
     * @throws BadRequestError if the date is in invalid format
     * 
     * today is for debug only; sets the current date for reproducibility
     */
    public birthDateIsValid(birthDate: string, today: Date = new Date()): boolean {
        today.setUTCHours(0, 0, 0, 0);
        const [year, month, day] = birthDate.split("-").map(Number);
        if (!year || !month || !day) {
            throw new BadRequestError(`Invalid date: YEAR:${year}, MONTH:${month}, DAY:${day}`);
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
     * @throws UserNotFoundError if user does not exist
     */
    private async getPrivateUser(id: string): Promise<User> {
        const user = await this.users.findById(id);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    /**
     * Gets a user by email, including all information
     * @param email The email of the user
     * @returns The User
     * @throws UserNotFoundError if user does not exist
     */
    private async getPrivateUserByEmail(email: string): Promise<User> {
        const user = await this.users.findByEmail(email);

        if (!user) {
            throw new UserNotFoundError(email);
        }

        return user;
    }

    /**
     * Returns the public (client safe) user object for a given user ID
     * @param userId The ID of the user to get
     * @param actorId The ID of the user who is doing the getting
     * @returns The PublicUser
     * @throws UnauthorizedError if action is not authorized
     * @throws UserNotFoundError if user does not exist
     */
    public async getUserById(userId: string, actorId: string): Promise<PublicUser> {
        if (!(await this.authorization.authorizeAction(userId, actorId, UserAction.GetById))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.getPrivateUser(userId);
        return this.users.publicizeUser(user);
    }

    /**
     * Returns the public (client safe) user object for a given email
     * @param email The email of the user to get
     * @param actorId The ID of the user who is doing the getting
     * @returns The PublicUser
     * @throws UnauthorizedError if action is not authorized
     * @throws UserNotFoundError if user does not exist
     */
    public async getUserByEmail(email: string, actorId: string): Promise<PublicUser> {
        if (!(await this.authorization.authorizeAction(email, actorId, UserAction.GetByEmail))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.getPrivateUserByEmail(email);
        return this.users.publicizeUser(user);
    }

    /**
     * Creates a user
     * @internal DO NOT USE THIS METHOD. Intended to be called by AuthenticationService; this writes a raw password.
     * @param data The DTO for creating a user
     * @returns A new user
     * @throws UserNotOldEnoughError if user is not at least MINIMUM_AGE years old
     * @throws UserAlreadyExistsError if user already exists with that email
     */
    public async createUser(data: CreateUserDto): Promise<PrivateUser> {
        if (!this.birthDateIsValid(data.birthDate)) {
            throw new UserNotOldEnoughError();
        }
        const isExistingUser = await this.users.existsByEmail(data.email);
        if (isExistingUser) {
            throw new UserAlreadyExistsError(data.email);
        }
        return this.users.privatizeUser(await this.users.create(data));
    }

    /**
     * Updates a user's profile
     * @param actorId The ID of the user doing the updating
     * @param data The DTO for updating a profile
     * @throws UserNotFoundError if user does not exist
     * @throws UnauthorizedError if action not authorized
     */
    public async updateProfile(actorId: string, data: UpdateProfileDto): Promise<void> {
        if (!(await this.authorization.authorizeAction(actorId, actorId, UserAction.Update))) {
            throw new UnauthorizedError(`User is not permitted to perform this action`);
        }
        const user = await this.users.updateProfile(actorId, data);
        if (!user) {
            throw new UserNotFoundError(actorId);
        }
    }
}
