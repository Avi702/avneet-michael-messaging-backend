import multer from "multer";
import { BadRequestError } from "../../shared/errors/common";

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function uploadImage() {
    return multer({
        storage,
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
        fileFilter(req, file, callback) {
            if (!file.mimetype.startsWith("image/")) {
                return callback(new BadRequestError("Only image uploads are allowed"));
            }

            callback(null, true);
        },
    });
}
