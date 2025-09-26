import { isValidObjectId } from "mongoose";

export function validateObjectId(id, fieldName = "") {
    if (!isValidObjectId(id)) {
        throw new Error(`${fieldName} ID is not valid`);
    }

    return true;
}
