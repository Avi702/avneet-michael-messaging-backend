import { VARIABLES } from "./config/environment";
import { ApplicationBuilder } from "./manager/ApplicationBuilder";
import { Database } from "./manager/Database";
import { Manager } from "./manager/Manager";

(async () => {
    const applicationBuilder = new ApplicationBuilder();
    const database = new Database();
    const manager = new Manager(applicationBuilder, database);
    await manager.connectDatabase({
        useMemoryServer: (VARIABLES.env !== "production" && VARIABLES.env !== "development"),
        uri: VARIABLES.mongoDbUri,
    });
    manager.initializeApplication();
    manager.listen();
})();
