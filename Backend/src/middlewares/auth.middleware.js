import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const ERROR_MESSAGES = {
    UNAUTHORIZED: "Unauthorized request",
    TOKEN_EXPIRED: "Token expired, please login again",
};

export const authUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded?._id)
            .select("-password -refreshToken -__v")
            .lean();

        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);

        if ((error.name = "TokenExpiredError")) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, ERROR_MESSAGES.TOKEN_EXPIRED);
        }

        throw new ApiError(StatusCodes.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }
});
