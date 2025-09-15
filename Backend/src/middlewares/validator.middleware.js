import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse";

export function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(StatusCodes.CONFLICT)
            .json(new ApiResponse(StatusCodes.CONFLICT, "Validation failed", null, errors.array()));
    }

    next();
}
