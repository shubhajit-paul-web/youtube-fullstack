import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadFile(file) {
    if (!file?.buffer) return;

    try {
        return await imagekit.upload({
            file: file.buffer,
            fileName: uuidv4(),
            folder: "youtube",
        });
    } catch (error) {
        throw new ApiError(StatusCodes.CONFLICT, `Imagekit file uploading error: ${error.message}`);
    }
}
