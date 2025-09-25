import { isValidObjectId } from "mongoose";
import { ApiError } from "./ApiError.js";
import { StatusCodes } from "http-status-codes";

export function validateObjectId(id, fieldName = "ID") {
    if (!isValidObjectId(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `${fieldName} is not a valid ObjectId`);
    }

    return true;
}
