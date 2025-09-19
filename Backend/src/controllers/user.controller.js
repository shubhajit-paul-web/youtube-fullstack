import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";

/**
 * (Get current user)
 * GET /api/v1/users/me
 */
export const getCurrentUser = asyncHandler((req, res) => {
    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "User profile fetched successfully", req.user));
});

/**
 * (Update account details)
 * PATCH /api/v1/users/me
 * Body: { firstName, lastName, email }
 */
export const updateAccountDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { firstName, lastName, email } = req.body ?? {};

    if (!firstName && !lastName && !email) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No valid fields to update");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    // Update only the fields provided in the request body
    if (firstName) {
        user.fullName.firstName = firstName;
    }
    if (lastName) {
        user.fullName.lastName = lastName;
    }
    if (email) {
        if (user.email === email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You're already using this email address");
        }

        user.email = email;
    }

    const updatedUser = await user.save();

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "User details updated successfully", updatedUser));
});
