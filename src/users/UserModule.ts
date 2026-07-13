import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";

export class UserModule {
    public readonly repository = new UserRepository();
    public readonly service = new UserService(this.repository);
}
