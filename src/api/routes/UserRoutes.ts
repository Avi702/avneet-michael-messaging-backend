import { AuthenticationService } from "../../authentication/AuthenticationService";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middleware/authenticator";
import { getUserSchema, updateProfileSchema } from "../middleware/validators/users";
import { validate } from "../middleware/validators/validate";
import { BaseRoutes } from "./BaseRoutes";

export class UserRoutes extends BaseRoutes {
    constructor(
        private readonly controller: UserController,
        private readonly authenticationService: AuthenticationService
    ) {
        super();

        this.router.post("/getUser", authenticate(this.authenticationService), validate(getUserSchema), controller.getUser);
        this.router.post("/updateProfile", authenticate(this.authenticationService), validate(updateProfileSchema), controller.updateProfile);
    }
}
