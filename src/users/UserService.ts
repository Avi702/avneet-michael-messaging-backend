import type { CreateUserDto } from "./dto/CreateUserDto";
import type { UpdateProfileDto } from "./dto/UpdateProfileDto";
import type { PublicUser, User } from "./User.types";
import type { UserRepository } from "./UserRepository";

export class UserService {
    constructor(private readonly users: UserRepository) {}

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
     * Gets a user by ID
     * @param id The ID of the user
     * @returns A promise for the User
     * @throws Error if user does not exist
     */
    public async getUser(id: string): Promise<User> {
        const user = await this.users.findById(id);

        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }

        return user;
    }

    /**
     * Returns the public (client safe) user object for a given user ID
     * @param id The ID of the user
     * @returns A promise for the PublicUser
     */
    public async getPublicUser(id: string): Promise<PublicUser> {
        const user = await this.getUser(id);
        return {
            _id: user._id,
            createdAt: user.createdAt,
            displayName: user.displayName,
            lastOnline: user.lastOnline,
            isOnline: user.isOnline,
        };
    }

    /**
     * Creates a user
     * @param data The DTO for creating a user
     * @returns A promise for a new user
     * @throws Error if user is not at least MINIMUM_AGE years old
     * @throws Error if user already exists with that email
     */
    public async createUser(data: CreateUserDto): Promise<User> {
        if (!this.birthDateIsValid(data.birthDate)) {
            throw new Error(`User is not old enough! Birth date ${data.birthDate} is not at least ${UserService.MINIMUM_AGE} years ago`);
        }
        const isExistingUser = await this.users.existsByEmail(data.email);
        if (isExistingUser) {
            throw new Error(`User with email ${data.email} already exists`);
        }
        return this.users.create(data);
    }

    /**
     * Updates a user's profile
     * @param id The ID of the user
     * @param data The DTO for updating a profile
     * @throws Error if user does not exist
     */
    public async updateProfile(id: string, data: UpdateProfileDto): Promise<void> {
        const user = await this.users.updateProfile(id, data);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
    }
}