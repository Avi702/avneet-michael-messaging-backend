import { AuthenticationService } from "../../authentication/AuthenticationService";
import { AuthenticationController } from "../controllers/AuthenticationController";
import { authenticate } from "../middleware/authenticator";
import { authenticateSchema, loginSchema, refreshSchema, registerSchema, updatePasswordSchema } from "../middleware/validators/authentication";
import { validate } from "../middleware/validators/validate";
import { BaseRoutes } from "./BaseRoutes";

export class AuthenticationRoutes extends BaseRoutes {
    constructor(
        private readonly controller: AuthenticationController,
        private readonly authenticationService: AuthenticationService,
    ) {
        super();

        this.router.post("/login", validate(loginSchema), controller.login);
        this.router.post("/register", validate(registerSchema), controller.register);
        this.router.post("/authenticate", validate(authenticateSchema), controller.authenticate);
        this.router.post("/refresh", validate(refreshSchema), controller.refresh);
        this.router.post("/updatePassword", authenticate(this.authenticationService), validate(updatePasswordSchema), controller.updatePassword);
    }
}
