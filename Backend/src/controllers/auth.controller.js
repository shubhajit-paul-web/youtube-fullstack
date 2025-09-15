import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../services/storage.service.js";
import { StatusCodes } from "http-status-codes";
import { toMilliseconds } from "../utils/toMilliseconds.js";
import User from "../models/user.model.js";

/**
 * POST /api/v1/auth/register
 * Body: { username, email, fullName, password }
 * Files: { avatar, coverImage }
 */

export const register = asyncHandler(async (req, res) => {
    const { avatar, coverImage } = req.files;
    const {
        username,
        email,
        fullName: { firstName, lastName },
        password,
    } = req.body;

    if (!avatar) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(new ApiResponse(StatusCodes.BAD_REQUEST, "Avatar is required"));
    }

    try {
        // Check user is already exists or not
        const isUserExists = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (isUserExists) {
            return res
                .status(StatusCodes.CONFLICT)
                .json(new ApiResponse(StatusCodes.CONFLICT, "User is already exists"));
        }

        // files uploading on ImageKit
        const uploadedAvatar = await uploadFile(avatar?.[0]);

        // User data
        const userData = {
            username,
            email,
            fullName: {
                firstName,
                lastName,
            },
            avatar: uploadedAvatar?.url,
            password,
        };

        if (coverImage) {
            const uploadedCover = await uploadFile(coverImage?.[0]);
            userData.coverImage = uploadedCover?.url;
        }

        const createdUser = await User.create(userData);

        res.cookie("accessToken", createdUser.generateAccessToken(), {
            httpOnly: true,
            maxAge: toMilliseconds.days(1), // 1 day
        });

        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(StatusCodes.CREATED, "Registration successful", {
                username: createdUser.username,
                email: createdUser.email,
                fullName: createdUser.fullName,
                avatar: createdUser.avatar,
                coverImage: createdUser?.coverImage || null,
            })
        );
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(new ApiResponse(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
});
