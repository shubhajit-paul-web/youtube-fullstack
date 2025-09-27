import { StatusCodes } from "http-status-codes";
import { ApiError } from "./ApiError.js";

export function checkFileType(file, fileType, errorMessage = "Invalid file format") {
    if (file?.mimetype.startsWith(fileType + "/")) return true;

    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
}
