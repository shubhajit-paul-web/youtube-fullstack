import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadFile } from "../services/storage.service.js";
import { StatusCodes } from "http-status-codes";
import { toMilliseconds } from "../utils/toMilliseconds.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Generate access and refresh tokens
async function generateAccessAndRefreshTokens(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while generating access and refresh tokens"
        );
    }
}

/**
 * (Register user)
 * POST /api/v1/auth/register
 * Body: { username, email, fullName, password }
 * Files: { avatar, coverImage }
 */
export const registerUser = asyncHandler(async (req, res) => {
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
        new ApiResponse(StatusCodes.CREATED, "User registered successfully", {
            username: createdUser.username,
            email: createdUser.email,
            fullName: createdUser.fullName,
            avatar: createdUser.avatar,
            coverImage: createdUser?.coverImage,
        })
    );
});

/**
 * (Login user)
 * POST /api/v1/auth/login
 * Body: { identifier - email or username, password }
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(StatusCodes.OK)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(StatusCodes.OK, "Logged In successfully", user));
});

/**
 * (Logout user)
 * GET /api/v1/auth/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
    });

    return res
        .status(StatusCodes.OK)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(StatusCodes.OK, "Logged out successfully"));
});

/**
 * (Refresh access token)
 * GET /api/v1/auth/refresh-token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request");
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded?._id).select("_id refreshToken");

        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        return res
            .status(StatusCodes.OK)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(StatusCodes.OK, "Access token refreshed"));
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Token expired, please login again");
        }

        if (error.statusCode) {
            throw new ApiError(error.statusCode, error.message);
        }

        throw new ApiError();
    }
});
