import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../utils/ApiResponse.js";

export function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Customized the errors array
        const customErrors = errors.array().map((err) => {
            return {
                field: err.path,
                msg: err.msg,
            };
        });

        return res
            .status(StatusCodes.CONFLICT)
            .json(new ApiResponse(StatusCodes.CONFLICT, "Validation failed", null, customErrors));
    }

    next();
}
