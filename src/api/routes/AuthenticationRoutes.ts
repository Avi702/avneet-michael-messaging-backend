import { AuthenticationController } from "../controllers/AuthenticationController";
import { authenticateSchema, loginSchema, refreshSchema, registerSchema } from "../middleware/validators/authentication";
import { validate } from "../middleware/validators/validate";
import { BaseRoutes } from "./BaseRoutes";

export class AuthenticationRoutes extends BaseRoutes {
    constructor(private readonly controller: AuthenticationController) {
        super();

        this.router.post("/login", validate(loginSchema), controller.login);
        this.router.post("/register", validate(registerSchema), controller.register);
        this.router.post("/authenticate", validate(authenticateSchema), controller.authenticate);
        this.router.post("/refresh", validate(refreshSchema), controller.refresh);
    }
}
