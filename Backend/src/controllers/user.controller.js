import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";

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
 * (Update user account details)
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
    if (firstName) user.fullName.firstName = firstName;
    if (lastName) user.fullName.lastName = lastName;
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

/**
 * (Update user avatar)
 * PATCH /api/v1/users/me/avatar
 * File: { avatar }
 */
export const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatar = req.file;

    if (!avatar) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");
    }

    const uploadedAvatar = await uploadFile(avatar);

    if (!uploadedAvatar?.url) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar image upload failed. Please try again");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: uploadedAvatar?.url,
            },
        },
        { new: true }
    ).lean();

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Avatar image updated successfully", updatedUser));
});

/**
 * (Update user cover image)
 * PATCH /api/v1/users/me/cover-image
 * File: { coverImage }
 */
export const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImage = req.file;

    if (!coverImage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Cover image is required");
    }

    const uploadedCoverImage = await uploadFile(coverImage);

    if (!uploadedCoverImage?.url) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Cover image upload failed. Please try again");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: uploadedCoverImage?.url,
            },
        },
        { new: true }
    ).lean();

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Cover image updated successfully", updatedUser));
});
