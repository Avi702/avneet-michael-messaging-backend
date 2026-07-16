import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export interface DatabaseConfig {
    useMemoryServer: boolean;
    uri: string | undefined;
}

export class Database {
    private mongo: MongoMemoryServer | undefined;

    /**
     * Connects to the Mongoose database
     * 
     * @param config The configuration for the database connection
     * @see DatabaseConfig
     */
    public async connect(config: DatabaseConfig): Promise<void> {
        // Memory server; use the memory server
        if (config.useMemoryServer) {
            this.mongo = await MongoMemoryServer.create();
            await mongoose.connect(this.mongo.getUri());
            return;
        }
        // Other server
        else {
            if (!config.uri) {
                throw new Error("Must provide a database URI if not using memory server");
            }
            await mongoose.connect(config.uri);
            return;
        }
    }

    /**
     * Disconnects from the Mongo server
     * Also shuts down the memory server, if necessary
     */
    public async shutdown() {
        await mongoose.disconnect();
        if (this.mongo) {
            await this.mongo.stop();
        }
    }
}
