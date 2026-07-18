/**
 * A file representing an image
 */
export interface ImageFile {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    size: number;
}

/**
 * A service that stores and retrieves images
 */
export interface ImageStorageService {
    /**
     * Stores a file in the specified storage location
     * @param uri The URI of the file to store
     * @param file The file information and data
     */
    storeImage(uri: string, file: ImageFile): Promise<void>;
    /**
     * Retrieves a file from the specified storage location
     * @param uri The URI of the file to retrieve
     * @returns The file data in a Buffer
     */
    getImage(uri: string): Promise<Buffer>;
    /**
     * Removes a file from the specified storage location
     * @param uri The URI of the file to remove
     */
    deleteImage?(uri: string): Promise<void>;
}
