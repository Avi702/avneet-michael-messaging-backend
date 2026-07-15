import { Application } from "./manager/Application";

(async () => {
    const application = new Application();

    await application.initializeDatabase();
    await application.initializeServers();

    application.start();
})();
