import { VARIABLES } from "../config/environment";
import { Application } from "./Application";
import { ApplicationBuilder, ApplicationBuilderConfig } from "./ApplicationBuilder";
import { Database, DatabaseConfig } from "./Database";

export class Manager {
    private application: Application | undefined;
    private databaseInitialized: boolean = false;

    public constructor(
        private readonly applicationBuilder: ApplicationBuilder,
        private readonly database: Database,
    ) {}

    /**
     * Connects to the database
     */
    public async connectDatabase(config: DatabaseConfig) {
        await this.database.connect(config);
        this.databaseInitialized = true;
    }

    /**
     * Creates the application
     */
    public initializeApplication(config: ApplicationBuilderConfig) {
        if (!this.databaseInitialized) {
            throw new Error("Must initialize database before creating application");
        }
        this.application = this.applicationBuilder.buildApplication(config);
    }

    /**
     * Listens on the standard server
     * @param overridePort Override the .env port for testing
     * @returns The port, once listening
     */
    public async listen(overridePort: number | undefined = undefined): Promise<number> {
        if (!this.databaseInitialized) {
            throw new Error("Must initialize database and create application before creating application");
        }
        if (!this.application) {
            throw new Error("Must create application before listening");
        }
        return this.application.start(overridePort ?? VARIABLES.port);
    }

    /**
     * Shuts down all servers
     */
    public async shutdown() {
        if (!this.application) {
            throw new Error("Cannot shut down server: application not initialized");
        }
        if (!this.databaseInitialized) {
            throw new Error("Cannot shut down server: database not initialized")
        }
        this.application.stop();
        await this.database.shutdown();
    }
}
