import bcrypt from "bcrypt";

export class PasswordService {
    private readonly saltRounds = 10;

    /**
     * Hashes a password
     * @param password The raw password to hash
     * @returns The hash of the password
     */
    public async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Compares an entered plaintext password against the database hash
     * @param password The user-entered plaintext password
     * @param hash The hash stored in the database
     * @returns Whether the password is valid
     */
    public async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
