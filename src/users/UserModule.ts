import { UserAuthorizationService } from "./UserAuthorizationService";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";

export class UserModule {
    public readonly repository = new UserRepository();
    public readonly authorization = new UserAuthorizationService(this.repository);
    public readonly service = new UserService(this.repository, this.authorization);
}
