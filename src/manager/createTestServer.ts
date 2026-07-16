import { ApplicationBuilder } from "./ApplicationBuilder";
import { Database } from "./Database";
import { Manager } from "./Manager";

interface TestServerSpecification {
    manager: Manager;
    port: number;
    baseUrl: string;
}

/**
 * Creates a server for testing
 * @returns The test server information
 */
export async function createTestServer(): Promise<TestServerSpecification> {
    const manager = new Manager(
        new ApplicationBuilder(),
        new Database()
    );

    await manager.connectDatabase({
        useMemoryServer: true,
        uri: undefined
    });

    manager.initializeApplication();

    const port = await manager.listen(0);

    return {
        manager,
        port,
        baseUrl: `http://localhost:${port}`,
    };
}
