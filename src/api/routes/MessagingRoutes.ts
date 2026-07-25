import { AuthenticationService } from "../../authentication/AuthenticationService";
import { MessagingController } from "../controllers/MessagingController";
import { authenticate } from "../middleware/authenticator";
import { uploadImage } from "../middleware/uploadImage";
import { addMemberToChatSchema, createChatSchema, getChatSchema, getImageSchema, removeMemberFromChatSchema, updateChatInformationSchema, uploadImageSchema } from "../middleware/validators/messaging";
import { validate } from "../middleware/validators/validate";
import { BaseRoutes } from "./BaseRoutes";

export class MessagingRoutes extends BaseRoutes {
    constructor(
        private readonly controller: MessagingController,
        private readonly authenticationService: AuthenticationService,
    ) {
        super();

        this.router.post("/createChat", authenticate(this.authenticationService), validate(createChatSchema), controller.createChat);
        this.router.post("/getChat", authenticate(this.authenticationService), validate(getChatSchema), controller.getChat);
        this.router.post("/getChats", authenticate(this.authenticationService), controller.getChats);
        this.router.post("/addMemberToChat", authenticate(this.authenticationService), validate(addMemberToChatSchema), controller.addMemberToChat);
        this.router.post("/removeMemberFromChat", authenticate(this.authenticationService), validate(removeMemberFromChatSchema), controller.removeMemberFromChat);
        this.router.post("/updateChatInformation", authenticate(this.authenticationService), validate(updateChatInformationSchema), controller.updateChatInformation);
        this.router.post("/uploadImage", authenticate(this.authenticationService), uploadImage().single("image"), validate(uploadImageSchema), controller.uploadImage);
        this.router.post("/getImage", authenticate(this.authenticationService), validate(getImageSchema), controller.getImage);
    }
}
