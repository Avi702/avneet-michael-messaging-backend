import type { User } from "../User.types";

export type CreateUserDto = Pick<User, "birthDate" | "displayName" | "email" | "password">;
