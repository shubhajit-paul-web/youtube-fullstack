import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Upload file
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

// Get file id by URL
async function getFileIdByUrl(url = "") {
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT + "/youtube/";

    if (typeof url !== "string" && !url.startsWith(urlEndpoint)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid file URL");
    }

    const fileName = url.replace(urlEndpoint, "");

    try {
        const files = await imagekit.listFiles({
            searchQuery: `name="${fileName}"`,
            limit: 1,
        });

        if (files.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, "File not found");
        }

        return files[0]?.fileId;
    } catch (error) {
        console.error("Imagekit list files error:", error.message);
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while fetching the file"
        );
    }
}

// Delete file
export async function deleteFile(url = "") {
    const fileId = await getFileIdByUrl(url);

    if (!fileId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "File id not found");
    }

    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        console.error("Imagekit delete file error:", error.message);
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while deleting the file"
        );
    }
}
