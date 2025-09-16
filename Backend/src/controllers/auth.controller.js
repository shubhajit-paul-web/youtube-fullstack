import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadFile } from "../services/storage.service.js";
import { StatusCodes } from "http-status-codes";
import { toMilliseconds } from "../utils/toMilliseconds.js";
import User from "../models/user.model.js";

/**
 * POST /api/v1/auth/register
 * Body: { username, email, fullName, password }
 * Files: { avatar, coverImage }
 */

const register = asyncHandler(async (req, res) => {
    const { avatar, coverImage } = req.files;
    const { username, email, firstName, lastName, password } = req.body;

    if (!avatar) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Avatar file is required");
    }

    // Check user is already exists or not
    const isUserExists = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (isUserExists) {
        throw new ApiError(StatusCodes.CONFLICT, "User is already exists");
    }

    // files uploading on ImageKit
    const [uploadedAvatar, uploadedCover] = await Promise.all([
        uploadFile(avatar?.[0]),
        uploadFile(coverImage?.[0]),
    ]);

    const createdUser = await User.create({
        username,
        email,
        fullName: {
            firstName,
            lastName,
        },
        avatar: uploadedAvatar?.url,
        coverImage: uploadedCover?.url || "",
        password,
    });

    if (!createdUser) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while registering the user"
        );
    }

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
            coverImage: createdUser?.coverImage,
        })
    );
});

export default { register };
