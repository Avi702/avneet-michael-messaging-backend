import type { User } from "../User.types";

export type UpdateProfileDto = Pick<User, "displayName"> & Partial<Pick<User, "bio">>;
