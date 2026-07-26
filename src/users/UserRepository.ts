import type { CreateUserDto } from "./dto/CreateUserDto";
import type { UpdateProfileDto } from "./dto/UpdateProfileDto";
import { UserModel } from "./User.model";
import type { PrivateUser, PublicUser, User } from "./User.types";

export class UserRepository {
    /**
     * Creates a new user
     * @param data The user's information
     * @returns The user
     */
    public async create(data: CreateUserDto): Promise<User> {
        return await UserModel.create(data);
    }

    /**
     * Finds a user by ID
     * @param id The ID of the user
     * @returns A user or null
     */
    public async findById(id: string): Promise<User | null> {
        return await UserModel.findById(id).lean().exec();
    }

    /**
     * Finds a user by email
     * @param email The user's email
     * @returns The user or null
     */
    public async findByEmail(email: string): Promise<User | null> {
        return await UserModel.findOne({ email: email }).lean().exec();
    }
    
    /**
     * Checks whether there is a user with a given email
     * @param email The user's email
     * @returns A boolean whether the user exists
     */
    public async existsByEmail(email: string): Promise<boolean> {
        return (await UserModel.countDocuments({ email: email })) > 0;
    }

    /**
     * Updates a user's profile fields
     * @param id The ID of the target user
     * @param data The fields to update
     * @returns The user, or null
     */
    public async updateProfile(id: string, data: UpdateProfileDto): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(id, {
            $set: data,
        }, { new: true, }).lean().exec();
    }

    /**
     * Updates a user's password
     * @param id The ID of the user string
     * @param hash The hash of the new password
     */
    public async updatePassword(id: string, hash: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            $set: { password: hash, },
        }).lean().exec();
    }

    /**
     * Marks a user as online or offline
     * @param id The ID of the user
     * @param isOnline Whether the user should be marked as online
     */
    public async setOnline(id: string, isOnline: boolean): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            $set: { isOnline: isOnline, },
        }).lean().exec();
    }

    /**
     * Deletes a user
     * @param id The ID of the user
     */
    public async delete(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id).lean().exec();
    }

    /**
     * Publicizes (strips sensitive fields) from a User
     * @param user The original User object
     * @returns A PublicUser with the original fields stripped
     */
    public publicizeUser(user: User): PublicUser {
        return {
            _id: user._id,
            displayName: user.displayName,
            bio: user.bio,
            createdAt: user.createdAt,
            lastOnline: user.lastOnline,
            isOnline: user.isOnline,
        };
    }

    /**
     * Privatizes (strips only the password) a User for the user themselves
     * @param user The original User object
     * @returns A PrivateUser containing the user's own private fields
     */
    public privatizeUser(user: User): PrivateUser {
        return {
            ...this.publicizeUser(user),
            email: user.email,
            birthDate: user.birthDate,
        };
    }
}
