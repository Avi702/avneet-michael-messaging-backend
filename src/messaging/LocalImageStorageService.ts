import { ImageFile, ImageStorageService } from "./ImageStorageService";
import path from "path";
import fs from "fs/promises";

export class LocalImageStorageService implements ImageStorageService {
    constructor(
        private readonly storageDirectory: string,
    ) {}

    async storeImage(uri: string, file: ImageFile): Promise<void> {
        const fullPath = path.join(this.storageDirectory, uri);
        await fs.mkdir(path.dirname(fullPath), {
            recursive: true,
        });
        await fs.writeFile(fullPath, file.buffer);
    }

    async getImage(uri: string): Promise<Buffer> {
        const fullPath = path.join(this.storageDirectory, uri);
        return fs.readFile(fullPath);
    }
}
