import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

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

    const user = await User.findById(userId).select("firstName lastName email");

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

    const user = await User.findById(req.user?._id).select("-watchHistory");

    if (user.avatar) deleteFile(user.avatar);

    user.avatar = uploadedAvatar.url;
    const updatedUser = await user.save({ validateBeforeSave: false });

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

    const user = await User.findById(req.user?._id).select("-watchHistory");

    if (user.coverImage) deleteFile(user.coverImage);

    user.coverImage = uploadedCoverImage.url;
    const updatedUser = await user.save({ validateBeforeSave: false });

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Cover image updated successfully", updatedUser));
});

/**
 * (Get user channel profile)
 * PATCH /api/v1/users/:username
 */
export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.trim()?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
                createdAt: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Channel not found");
    }

    return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, "Channel fetched successfully", channel[0]));
});
